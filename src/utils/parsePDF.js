import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function toNum(str) {
  if (!str) return 0
  return parseFloat(str.replace(/,/g, '')) || 0
}

async function extractPageText(page) {
  const content = await page.getTextContent()

  // Get items with positions
  const items = content.items
    .filter(item => item.str && item.str.trim())
    .map(item => ({
      str: item.str.trim(),
      x: Math.round(item.transform[4]),
      y: Math.round(item.transform[5]),
    }))

  // Sort top-to-bottom (y descends in PDF coords), then left-to-right
  items.sort((a, b) => b.y - a.y || a.x - b.x)

  // Group items into rows (within 4pt vertical threshold)
  const rows = []
  for (const item of items) {
    const last = rows[rows.length - 1]
    if (last && Math.abs(last.y - item.y) <= 4) {
      last.items.push(item)
    } else {
      rows.push({ y: item.y, items: [item] })
    }
  }

  // Join each row left-to-right, rows separated by newline
  return rows
    .map(row => row.items.sort((a, b) => a.x - b.x).map(i => i.str).join(' '))
    .join('\n')
}

function parseRCDPage(text) {
  // ── Date ─────────────────────────────────────────────────────
  // Matches "Date : 01/08/2026" or just "01/08/2026" anywhere
  const dateMatch = text.match(/(?:Date\s*:\s*)?(\d{2})\/(\d{2})\/(20\d{2})/i)
  if (!dateMatch) return null

  const month = parseInt(dateMatch[1])
  const day = parseInt(dateMatch[2])
  const year = parseInt(dateMatch[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  // ── CPQ Report No. ───────────────────────────────────────────
  // Matches "CPQ-2026-01 04", "CPQ-2026-01-04", "CPQ 2026 01 04"
  const cpqMatch = text.match(/CPQ[-\s](\d{4})[-\s](\d{2})[-\s](\d+)/i)
  const reportNo = cpqMatch
    ? `CPQ-${cpqMatch[1]}-${cpqMatch[2]}-${cpqMatch[3]}`
    : ''

  // ── Collection (Debit) from Summary section ──────────────────
  // "ADD : Collection  697,123.67" — first amount after the label
  const collectionMatch = text.match(/ADD\s*[:\s]+Collection\s+([\d,]+\.\d{2})/i)
  if (!collectionMatch) return null

  // ── Remittance / Deposit (Credit) from Summary section ───────
  // "LESS : Deposit  1,305,399.17"
  const depositMatch = text.match(/LESS\s*[:\s]+Deposit\s+([\d,]+\.\d{2})/i)

  // ── Beginning Balance ────────────────────────────────────────
  const beginningMatch = text.match(/BEGINNING\s+BALANCE\s+([\d,]+\.\d{2})/i)

  // ── Ending Balance ───────────────────────────────────────────
  const endingMatch = text.match(/ENDING\s+BALANCE\s+([\d,]+\.\d{2})/i)

  return {
    month,
    day,
    year,
    displayDate: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
    reportNo,
    particulars: reportNo || `RCD ${month}/${day}/${year}`,
    reference: reportNo,
    debit: toNum(collectionMatch[1]),
    credit: toNum(depositMatch?.[1]),
    beginningBalance: toNum(beginningMatch?.[1]),
    endingBalance: toNum(endingMatch?.[1]),
  }
}

export async function parseRCDFile(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const entries = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const text = await extractPageText(page)
    const entry = parseRCDPage(text)
    if (entry) entries.push(entry)
  }

  return entries
}

export function groupByMonth(allEntries) {
  const map = {}

  for (const rcd of allEntries) {
    const key = `${rcd.year}-${String(rcd.month).padStart(2, '0')}`
    if (!map[key]) {
      const last = new Date(rcd.year, rcd.month, 0).getDate()
      map[key] = {
        sheetName: key,
        label: `${MONTH_NAMES[rcd.month]} ${rcd.year}`,
        month: rcd.month,
        year: rcd.year,
        lastDay: `${MONTH_NAMES[rcd.month]} ${last}, ${rcd.year}`,
        rcds: [],
        entries: [],
        beginningBalance: 0,
        endingBalance: 0,
      }
    }
    map[key].rcds.push(rcd)
  }

  for (const group of Object.values(map)) {
    // Sort RCDs by day then report number
    group.rcds.sort((a, b) => a.day - b.day || a.reportNo.localeCompare(b.reportNo))
    group.beginningBalance = group.rcds[0]?.beginningBalance ?? 0

    // Expand each RCD into up to 2 cashbook rows
    const rows = []
    for (const rcd of group.rcds) {
      // Row 1 — Collection (Debit)
      rows.push({
        displayDate: rcd.displayDate,
        particulars: rcd.reportNo,
        reference: '',
        debit: rcd.debit,
        credit: 0,
      })
      // Row 2 — Remittance/Deposit (Credit) — only if deposit > 0
      if (rcd.credit > 0) {
        rows.push({
          displayDate: rcd.displayDate,
          particulars: rcd.reportNo,
          reference: '',
          debit: 0,
          credit: rcd.credit,
        })
      }
    }

    // Compute running balance across all rows
    let balance = group.beginningBalance
    for (const row of rows) {
      balance = balance + row.debit - row.credit
      row.balance = balance
    }

    group.entries = rows
    group.endingBalance = balance
  }

  return Object.values(map).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
}
