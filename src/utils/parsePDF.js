import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const CPQ_RE = /CPQ\s*\d{4}-\d{2}-\d+/i

const MONTH_MAP = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function lastDay(month, year) {
  return new Date(year, month, 0).getDate()
}

function detectMonthYear(rows) {
  for (const row of rows.slice(0, 15)) {
    const text = row.text
    const match = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/i)
    if (match) {
      const month = MONTH_MAP[match[1].toLowerCase()]
      const year = parseInt(match[2])
      return { month, year }
    }
  }
  return null
}

function groupByRows(items, threshold = 3) {
  const rows = []
  for (const item of items) {
    let placed = false
    for (const row of rows) {
      if (Math.abs(row.y - item.y) <= threshold) {
        row.items.push(item)
        placed = true
        break
      }
    }
    if (!placed) rows.push({ y: item.y, items: [item] })
  }
  rows.sort((a, b) => b.y - a.y)
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x)
    row.text = row.items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim()
  }
  return rows
}

function findHeaderRow(rows) {
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i].text.toLowerCase()
    if (t.includes('particulars') && t.includes('debit') && t.includes('balance')) {
      const cols = {}
      for (const item of rows[i].items) {
        const key = item.str.toLowerCase().trim()
        if (key === 'date') cols.date = item.x
        else if (key === 'particulars') cols.particulars = item.x
        else if (key === 'reference') cols.reference = item.x
        else if (key === 'debit') cols.debit = item.x
        else if (key === 'credit') cols.credit = item.x
        else if (key === 'balance') cols.balance = item.x
      }
      if (cols.particulars && cols.debit) return { idx: i, cols }
    }
  }
  return null
}

function assignCol(x, cols) {
  const candidates = Object.entries(cols)
    .filter(([, cx]) => cx !== undefined)
    .map(([name, cx]) => ({ name, dist: Math.abs(x - cx) }))
  if (!candidates.length) return 'particulars'
  return candidates.reduce((a, b) => a.dist < b.dist ? a : b).name
}

function parseAmount(str) {
  if (!str) return null
  const cleaned = str.replace(/[₱,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

async function extractPageItems(page) {
  const content = await page.getTextContent()
  return content.items
    .filter(item => item.str && item.str.trim())
    .map(item => ({
      str: item.str.trim(),
      x: Math.round(item.transform[4] * 10) / 10,
      y: Math.round(item.transform[5] * 10) / 10,
    }))
}

export async function parsePDF(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const allSheets = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const items = await extractPageItems(page)
    if (!items.length) continue

    const rows = groupByRows(items)
    const monthInfo = detectMonthYear(rows)
    if (!monthInfo) continue

    const header = findHeaderRow(rows)
    if (!header) continue

    const { idx: hIdx, cols } = header
    let beginningBalance = 0
    const entries = []

    for (const row of rows.slice(hIdx + 1)) {
      const lower = row.text.toLowerCase()
      if (!row.text || lower === '') continue
      if (lower.includes('total') || lower.includes('grand total')) continue

      // Beginning balance row
      if (lower.includes('beginning balance')) {
        for (const item of row.items) {
          if (assignCol(item.x, cols) === 'balance') {
            beginningBalance = parseAmount(item.str) ?? 0
          }
        }
        continue
      }

      // Data row — collect by column
      const cell = { particulars: [], reference: '', debit: null, credit: null }
      for (const item of row.items) {
        const col = assignCol(item.x, cols)
        if (col === 'date') continue // date unreliable — skip per spec
        else if (col === 'particulars') cell.particulars.push(item.str)
        else if (col === 'reference') cell.reference = item.str
        else if (col === 'debit') cell.debit = parseAmount(item.str)
        else if (col === 'credit') cell.credit = parseAmount(item.str)
        // balance column skipped — recomputed
      }

      if (cell.debit === null && cell.credit === null) continue

      const particulars = cell.particulars.join(' ').trim()
      const cpqMatch = particulars.match(CPQ_RE)
      const reference = cell.reference || (cpqMatch ? cpqMatch[0] : '')

      entries.push({
        particulars,
        reference,
        debit: cell.debit ?? 0,
        credit: cell.credit ?? 0,
      })
    }

    // Compute running balance
    let balance = beginningBalance
    const computed = entries.map(e => {
      balance = balance + e.debit - e.credit
      return { ...e, balance }
    })

    const { month, year } = monthInfo
    const monthName = MONTH_NAMES[month]
    const last = lastDay(month, year)

    allSheets.push({
      sheetName: `page_${p}`,
      label: `${monthName} ${year}`,
      month,
      year,
      lastDay: `${monthName} ${last}, ${year}`,
      beginningBalance,
      entries: computed,
      endingBalance: computed.length ? computed[computed.length - 1].balance : beginningBalance,
    })
  }

  allSheets.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
  return allSheets
}
