import * as XLSX from 'xlsx'

const HEADER_BLUE = '185FA5'
const LIGHT_BLUE = 'DDEEFF'
const GRAY = 'D9D9D9'
const NUM_FMT = '#,##0.00'

function cell(v, t = 's') {
  return { v, t }
}

function numCell(v) {
  return { v: v ?? 0, t: 'n', z: NUM_FMT }
}

function styledCell(v, style, t = 's') {
  return { v, t, s: style }
}

function merge(r1, c1, r2, c2) {
  return { s: { r: r1, c: c1 }, e: { r: r2, c: c2 } }
}

function setCell(ws, row, col, cellObj) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  ws[addr] = cellObj
}

function formatDate(dateSerial, month, year) {
  if (!dateSerial) return ''
  const d = new Date(Math.round((dateSerial - 25569) * 86400 * 1000))
  if (isNaN(d.getTime())) return ''
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${m}/${day}`
}

export function generateCashbook(sheetData, treasurerName) {
  const { label, month, year, lastDay, beginningBalance, entries, endingBalance } = sheetData

  const wb = XLSX.utils.book_new()
  const ws = {}
  const merges = []

  let r = 0

  // Row 1 — title
  setCell(ws, r, 0, {
    v: 'CASHBOOK — CASH IN TREASURY',
    t: 's',
    s: {
      font: { bold: true, sz: 13 },
      fill: { fgColor: { rgb: LIGHT_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  })
  merges.push(merge(r, 0, r, 5))
  r++

  // Row 2 — subtitle
  setCell(ws, r, 0, {
    v: `Municipality of Dulag · General Fund · ${label}`,
    t: 's',
    s: {
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  })
  merges.push(merge(r, 0, r, 5))
  r++

  // Row 3 — spacer
  r++

  // Row 4 — column headers
  const headers = ['Date', 'Particulars', 'Reference', 'Debit', 'Credit', 'Balance']
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: HEADER_BLUE } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
    },
  }
  headers.forEach((h, c) => {
    setCell(ws, r, c, { v: h, t: 's', s: headerStyle })
  })
  r++

  // Row 5 — beginning balance
  const bbStyle = { font: { italic: true }, alignment: { horizontal: 'left' } }
  setCell(ws, r, 0, { v: '', t: 's' })
  setCell(ws, r, 1, { v: 'Beginning Balance', t: 's', s: bbStyle })
  setCell(ws, r, 2, { v: '', t: 's' })
  setCell(ws, r, 3, { v: '', t: 's' })
  setCell(ws, r, 4, { v: '', t: 's' })
  setCell(ws, r, 5, { v: beginningBalance, t: 'n', z: NUM_FMT })
  r++

  // Data rows
  const dataStartRow = r
  for (const entry of entries) {
    setCell(ws, r, 0, { v: formatDate(entry.dateSerial, month, year), t: 's' })
    setCell(ws, r, 1, { v: entry.particulars, t: 's' })
    setCell(ws, r, 2, { v: entry.reference, t: 's' })
    setCell(ws, r, 3, { v: entry.debit, t: 'n', z: NUM_FMT })
    setCell(ws, r, 4, { v: entry.credit, t: 'n', z: NUM_FMT })
    setCell(ws, r, 5, { v: entry.balance, t: 'n', z: NUM_FMT })
    r++
  }

  // Total row
  const totalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: GRAY } },
  }
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  setCell(ws, r, 0, { v: '', t: 's', s: totalStyle })
  setCell(ws, r, 1, { v: 'TOTAL', t: 's', s: { ...totalStyle, alignment: { horizontal: 'right' } } })
  setCell(ws, r, 2, { v: '', t: 's', s: totalStyle })
  setCell(ws, r, 3, { v: totalDebit, t: 'n', z: NUM_FMT, s: totalStyle })
  setCell(ws, r, 4, { v: totalCredit, t: 'n', z: NUM_FMT, s: totalStyle })
  setCell(ws, r, 5, { v: endingBalance, t: 'n', z: NUM_FMT, s: totalStyle })
  r++

  // Spacer
  r++

  // Certification
  setCell(ws, r, 0, { v: 'CERTIFICATION', t: 's', s: { font: { bold: true } } })
  r++

  const certText =
    `I hereby certify that the foregoing is a correct and complete record of all my\n` +
    `collections, deposits/remittances, and balances of my accounts in the Cash in\n` +
    `Treasury as of ${lastDay}.`
  setCell(ws, r, 0, {
    v: certText,
    t: 's',
    s: {
      font: { italic: true },
      alignment: { wrapText: true, vertical: 'top' },
    },
  })
  merges.push(merge(r, 0, r + 1, 5))
  r += 2

  // Spacer before signature
  r++

  // Signature row
  const sigStyle = {
    font: { underline: true },
    alignment: { horizontal: 'center' },
  }
  setCell(ws, r, 1, { v: treasurerName.toUpperCase(), t: 's', s: sigStyle })
  setCell(ws, r, 4, { v: lastDay, t: 's', s: sigStyle })
  r++

  // Signature labels
  setCell(ws, r, 1, {
    v: 'Municipal Treasurer',
    t: 's',
    s: { alignment: { horizontal: 'center' } },
  })
  setCell(ws, r, 4, {
    v: 'Date',
    t: 's',
    s: { alignment: { horizontal: 'center' } },
  })
  r++

  // Set worksheet range
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: 5 } })
  ws['!merges'] = merges
  ws['!cols'] = [
    { wch: 10 },
    { wch: 45 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ]

  const monthName = label.split(' ')[0]
  XLSX.utils.book_append_sheet(wb, ws, 'Cashbook')
  XLSX.writeFile(wb, `${monthName}_${year}_Cashbook.xlsx`)
}
