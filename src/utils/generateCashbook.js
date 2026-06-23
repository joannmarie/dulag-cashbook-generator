import * as XLSX from 'xlsx'

export async function generateCashbook(sheetData, treasurerName) {
  const { label, year, monthRange, lastDay, beginningBalance, entries } = sheetData

  const res = await fetch('/Cashbook.xlsx')
  const buf = await res.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellStyles: true })

  const origName = wb.SheetNames[0]
  const tmpl = wb.Sheets[origName]

  // Get style from a template cell
  const ts = (addr) => tmpl[addr]?.s || {}

  // Clone template sheet (deep copy all cells)
  const ws = {}
  for (const key in tmpl) {
    if (key.startsWith('!')) continue
    ws[key] = JSON.parse(JSON.stringify(tmpl[key]))
  }
  ws['!cols'] = tmpl['!cols']

  // Update F3 = beginning balance (keep template style)
  ws['F3'] = { v: beginningBalance, t: 'n', s: ts('F3'), z: '#,##0.00' }

  // Clear rows 4–74 (r=3 to r=73): wipe values/formulas, keep styles
  for (let r = 3; r <= 73; r++) {
    for (let c = 0; c <= 8; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (ws[addr]) {
        ws[addr] = { v: '', t: 's', s: ws[addr].s || {} }
      }
    }
  }

  // Drop merges in the data area; keep header merges (rows 0–1 only)
  ws['!merges'] = (tmpl['!merges'] || []).filter(m => m.e.r <= 1)

  function setCell(r, c, v, t, s, z) {
    const addr = XLSX.utils.encode_cell({ r, c })
    ws[addr] = { v, t: t || (typeof v === 'number' ? 'n' : 's'), s: s || {} }
    if (z) ws[addr].z = z
  }

  function setFml(r, c, f, v, s, z) {
    const addr = XLSX.utils.encode_cell({ r, c })
    ws[addr] = { f, v: v || 0, t: 'n', s: s || {} }
    if (z) ws[addr].z = z
  }

  // ── Data rows (row 4 onwards) ────────────────────────────────────
  const DATA_R0 = 3 // 0-indexed; Excel row 4

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const r  = DATA_R0 + i
    const er = r + 1 // Excel 1-indexed row number

    setCell(r, 0, entry.fullDate || '', 's', ts('A4'))
    setCell(r, 1, entry.particulars, 's', ts('B4'))
    setCell(r, 2, '', 's', ts('C4'))
    if (entry.debit)  setCell(r, 3, entry.debit,  'n', ts('D4'), '#,##0.00')
    if (entry.credit) setCell(r, 4, entry.credit, 'n', ts('E4'), '#,##0.00')
    // Balance: prev balance + debit - credit; first row references F3
    setFml(r, 5, `+F${er - 1}+D${er}-E${er}`, entry.balance, ts('F4'), '#,##0.00')
  }

  // ── Totals row ────────────────────────────────────────────────────
  //   DATA_R0=3 → first data Excel row=4, last data Excel row = DATA_R0+N
  //   where N=entries.length (same numeric value by coincidence of DATA_R0=3)
  const totR0       = DATA_R0 + entries.length          // 0-indexed
  const totER       = totR0 + 1                          // Excel row
  const firstDataER = DATA_R0 + 1                        // = 4
  const lastDataER  = DATA_R0 + entries.length           // = 3+N (Excel row of last data row)

  const totalDebit  = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const endBal      = entries.length ? entries[entries.length - 1].balance : beginningBalance

  setCell(totR0, 0, '', 's', ts('A35'))
  setCell(totR0, 1, '', 's', ts('B35'))
  setCell(totR0, 2, '', 's', ts('C35'))
  setFml(totR0, 3, `SUM(D${firstDataER}:D${lastDataER})`, totalDebit,  ts('D35'), '#,##0.00')
  setFml(totR0, 4, `SUM(E${firstDataER}:E${lastDataER})`, totalCredit, ts('E35'), '#,##0.00')
  setFml(totR0, 5, `+F3+D${totER}-E${totER}`,             endBal,      ts('F35'), '#,##0.00')

  // ── Certification (3 blank rows after totals) ─────────────────────
  const certR = totR0 + 3

  const certText =
    'I HEREBY CERTIFY that the foregoing is a correct and complete record of the cash ' +
    'transactions had by me in my capacity as Municipal Treasurer of LGU-Dulag, Leyte ' +
    `during the period from ${monthRange.toUpperCase()}, inclusive, as indicated in the ` +
    'corresponding columns.'

  setCell(certR, 1, certText, 's', {
    ...ts('B45'),
    alignment: { wrapText: true, vertical: 'top' },
  })
  ws['!merges'].push({ s: { r: certR, c: 1 }, e: { r: certR + 2, c: 3 } })

  // ── Signature block (5 rows after cert) ───────────────────────────
  const sigR = certR + 5

  const underlineCenter = { font: { underline: true }, alignment: { horizontal: 'center' } }
  const center          = { alignment: { horizontal: 'center' } }

  setCell(sigR,     1, treasurerName.toUpperCase(), 's', underlineCenter)
  setCell(sigR,     4, lastDay,                     's', underlineCenter)
  setCell(sigR + 1, 1, 'Municipal Treasurer',       's', center)
  setCell(sigR + 1, 4, 'Date',                      's', center)

  // ── Update sheet ref and rename ───────────────────────────────────
  const lastR = sigR + 2
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastR, c: 8 } })

  const newName = label.toLowerCase().replace(' ', '-') + ' '
  delete wb.Sheets[origName]
  wb.SheetNames[0] = newName
  wb.Sheets[newName] = ws

  // ── Download ──────────────────────────────────────────────────────
  const [monthName] = label.split(' ')
  XLSX.writeFile(wb, `Cashbook_${monthName}-${year}.xlsx`)
}
