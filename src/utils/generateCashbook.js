import * as XLSX from 'xlsx'

const NAVY       = '1A3557'
const LIGHT_BLUE = 'DDEEFF'
const GRAY       = 'D9D9D9'
const NUM_FMT    = '#,##0.00'

function s(style) { return style }

function setCell(ws, r, c, v, t = 's', style = {}, z) {
  const addr = XLSX.utils.encode_cell({ r, c })
  ws[addr] = { v, t, s: style, ...(z ? { z } : {}) }
}

function merge(r1, c1, r2, c2) {
  return { s: { r: r1, c: c1 }, e: { r: r2, c: c2 } }
}

const CENTER = { alignment: { horizontal: 'center', vertical: 'center' } }
const CENTER_BOLD = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
const BOLD   = { font: { bold: true } }
const ITALIC = { font: { italic: true } }

const HEADER_STYLE = s({
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
  fill: { fgColor: { rgb: NAVY } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top:    { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left:   { style: 'thin', color: { rgb: '000000' } },
    right:  { style: 'thin', color: { rgb: '000000' } },
  },
})

const TOTAL_STYLE = s({
  font: { bold: true },
  fill: { fgColor: { rgb: GRAY } },
  border: {
    top:    { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
  },
})

export function generateCashbook(sheetData, treasurerName) {
  const { label, year, lastDay, beginningBalance, entries } = sheetData
  const totalDebit  = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const endingBalance = entries.length ? entries[entries.length - 1].balance : beginningBalance
  const monthName = label.split(' ')[0]

  const wb = XLSX.utils.book_new()
  const ws  = {}
  const merges = []
  let r = 0

  // ── Row 1: Title ────────────────────────────────────────────
  setCell(ws, r, 0, 'CASHBOOK — CASH IN TREASURY', 's', s({
    font: { bold: true, sz: 13 },
    fill: { fgColor: { rgb: LIGHT_BLUE } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }))
  merges.push(merge(r, 0, r, 5))
  r++

  // ── Row 2: Subtitle ─────────────────────────────────────────
  setCell(ws, r, 0, `Municipality of Dulag  ·  General Fund  ·  ${label}`, 's', CENTER)
  merges.push(merge(r, 0, r, 5))
  r++

  // ── Row 3: Spacer ────────────────────────────────────────────
  r++

  // ── Row 4: Column headers (two-row structure) ────────────────
  // A: DATE  B: PARTICULARS  C: REFERENCE  D-F: CASH IN TREASURY (merged)
  setCell(ws, r, 0, 'DATE',         's', HEADER_STYLE)
  setCell(ws, r, 1, 'PARTICULARS',  's', HEADER_STYLE)
  setCell(ws, r, 2, 'REFERENCE',    's', HEADER_STYLE)
  setCell(ws, r, 3, 'CASH IN TREASURY', 's', HEADER_STYLE)
  setCell(ws, r, 4, '',             's', HEADER_STYLE)
  setCell(ws, r, 5, '',             's', HEADER_STYLE)
  merges.push(merge(r, 3, r, 5))   // merge D:F for "CASH IN TREASURY"
  // A, B, C each span 2 rows
  merges.push(merge(r, 0, r + 1, 0))
  merges.push(merge(r, 1, r + 1, 1))
  merges.push(merge(r, 2, r + 1, 2))
  r++

  // ── Row 5: Sub-headers ───────────────────────────────────────
  setCell(ws, r, 0, '', 's', HEADER_STYLE)
  setCell(ws, r, 1, '', 's', HEADER_STYLE)
  setCell(ws, r, 2, '', 's', HEADER_STYLE)
  setCell(ws, r, 3, 'DEBIT',   's', HEADER_STYLE)
  setCell(ws, r, 4, 'CREDIT',  's', HEADER_STYLE)
  setCell(ws, r, 5, 'BALANCE', 's', HEADER_STYLE)
  r++

  // ── Row 6: Beginning Balance ─────────────────────────────────
  setCell(ws, r, 0, '', 's')
  setCell(ws, r, 1, 'BEGINNING BALANCE', 's', s({ font: { bold: true }, alignment: { horizontal: 'center' } }))
  setCell(ws, r, 2, '', 's')
  setCell(ws, r, 3, '', 's')
  setCell(ws, r, 4, '', 's')
  setCell(ws, r, 5, beginningBalance, 'n', BOLD, NUM_FMT)
  r++

  // ── Data rows ─────────────────────────────────────────────────
  for (const entry of entries) {
    setCell(ws, r, 0, entry.fullDate || '', 's')
    setCell(ws, r, 1, entry.particulars,    's')
    setCell(ws, r, 2, entry.reference || '', 's')
    if (entry.debit)  setCell(ws, r, 3, entry.debit,  'n', {}, NUM_FMT)
    if (entry.credit) setCell(ws, r, 4, entry.credit, 'n', {}, NUM_FMT)
    setCell(ws, r, 5, entry.balance, 'n', {}, NUM_FMT)
    r++
  }

  // ── Total row ─────────────────────────────────────────────────
  setCell(ws, r, 0, '',      's', TOTAL_STYLE)
  setCell(ws, r, 1, 'TOTAL', 's', s({ ...TOTAL_STYLE, alignment: { horizontal: 'right' } }))
  setCell(ws, r, 2, '',      's', TOTAL_STYLE)
  setCell(ws, r, 3, totalDebit,    'n', TOTAL_STYLE, NUM_FMT)
  setCell(ws, r, 4, totalCredit,   'n', TOTAL_STYLE, NUM_FMT)
  setCell(ws, r, 5, endingBalance, 'n', TOTAL_STYLE, NUM_FMT)
  r++

  // ── Spacer ────────────────────────────────────────────────────
  r++

  // ── Certification ─────────────────────────────────────────────
  setCell(ws, r, 0, 'CERTIFICATION', 's', BOLD)
  r++

  const certText =
    `I hereby certify that the foregoing is a correct and complete record of all my\n` +
    `collections, deposits/remittances, and balances of my accounts in the Cash in\n` +
    `Treasury as of ${lastDay}.`
  setCell(ws, r, 0, certText, 's', s({
    font: { italic: true },
    alignment: { wrapText: true, vertical: 'top' },
  }))
  merges.push(merge(r, 0, r + 1, 5))
  r += 2

  r++ // spacer before signature

  // ── Signature ─────────────────────────────────────────────────
  const sigStyle = s({ font: { underline: true }, alignment: { horizontal: 'center' } })
  setCell(ws, r, 1, treasurerName.toUpperCase(), 's', sigStyle)
  setCell(ws, r, 4, lastDay,                     's', sigStyle)
  r++

  setCell(ws, r, 1, 'Municipal Treasurer', 's', CENTER)
  setCell(ws, r, 4, 'Date',                's', CENTER)
  r++

  // ── Worksheet meta ────────────────────────────────────────────
  ws['!ref']  = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r, c: 5 } })
  ws['!merges'] = merges
  ws['!cols']   = [
    { wch: 12 },   // A Date
    { wch: 52 },   // B Particulars
    { wch: 16 },   // C Reference
    { wch: 16 },   // D Debit
    { wch: 16 },   // E Credit
    { wch: 16 },   // F Balance
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Cashbook')
  XLSX.writeFile(wb, `${monthName}_${year}_Cashbook.xlsx`)
}
