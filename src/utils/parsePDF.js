import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function toNum(str) {
  if (!str) return 0
  return parseFloat(str.replace(/,/g, '')) || 0
}

async function extractText(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pageTexts = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    pageTexts.push(content.items.map(i => i.str).join(' '))
  }
  return pageTexts
}

function parseRCDPage(text) {
  // Date
  const dateMatch = text.match(/Date\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (!dateMatch) return null

  const month = parseInt(dateMatch[1])
  const day = parseInt(dateMatch[2])
  const year = parseInt(dateMatch[3])

  // Report No. (CPQ number) — "CPQ-2026-01 04" or "CPQ-2026-01-04"
  const reportMatch = text.match(/Report\s+No\.\s*:\s*(CPQ[-\s]\d{4}[-\s]\d{2}[-\s]\d+)/i)
  const rawReport = reportMatch ? reportMatch[1].trim() : ''
  // Normalize to "CPQ-2026-01-04"
  const reportNo = rawReport.replace(/\s+/g, '-').replace(/--+/g, '-')

  // Grand Total Collection
  const collectionMatch = text.match(/GRAND\s+TOTAL\s+COLLECTION\s*:\s*([\d,]+\.\d{2})/i)
  if (!collectionMatch) return null

  // Deposit (from summary section "LESS : Deposit  nnn,nnn.nn")
  const depositMatch = text.match(/LESS\s*:\s*Deposit\s+([\d,]+\.\d{2})/i)

  // Beginning Balance
  const beginningMatch = text.match(/BEGINNING\s+BALANCE\s+([\d,]+\.\d{2})/i)

  // Ending Balance
  const endingMatch = text.match(/ENDING\s+BALANCE\s+([\d,]+\.\d{2})/i)

  return {
    month,
    day,
    year,
    displayDate: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
    reportNo,
    particulars: reportNo,
    reference: reportNo,
    debit: toNum(collectionMatch[1]),
    credit: toNum(depositMatch?.[1]),
    beginningBalance: toNum(beginningMatch?.[1]),
    endingBalance: toNum(endingMatch?.[1]),
  }
}

export async function parseRCDFile(file) {
  const pages = await extractText(file)
  const entries = []
  for (const text of pages) {
    const entry = parseRCDPage(text)
    if (entry) entries.push(entry)
  }
  return entries
}

export function groupByMonth(allEntries) {
  const map = {}

  for (const entry of allEntries) {
    const key = `${entry.year}-${String(entry.month).padStart(2, '0')}`
    if (!map[key]) {
      const last = new Date(entry.year, entry.month, 0).getDate()
      map[key] = {
        sheetName: key,
        label: `${MONTH_NAMES[entry.month]} ${entry.year}`,
        month: entry.month,
        year: entry.year,
        lastDay: `${MONTH_NAMES[entry.month]} ${last}, ${entry.year}`,
        entries: [],
        beginningBalance: 0,
        endingBalance: 0,
      }
    }
    map[key].entries.push(entry)
  }

  for (const group of Object.values(map)) {
    group.entries.sort((a, b) => a.day - b.day || a.reportNo.localeCompare(b.reportNo))
    group.beginningBalance = group.entries[0]?.beginningBalance ?? 0

    let balance = group.beginningBalance
    for (const e of group.entries) {
      balance = balance + e.debit - e.credit
      e.balance = balance
    }
    group.endingBalance = balance
  }

  return Object.values(map).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
}
