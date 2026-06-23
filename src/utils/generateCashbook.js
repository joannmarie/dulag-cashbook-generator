import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const NAVY = [26, 53, 87]
const GOLD = [201, 168, 76]
const LIGHT_GRAY = [245, 247, 250]
const DARK_GRAY = [60, 60, 60]

function peso(n) {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateSerial) {
  if (!dateSerial) return ''
  const d = new Date(Math.round((dateSerial - 25569) * 86400 * 1000))
  if (isNaN(d.getTime())) return ''
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${m}/${day}`
}

export function generateCashbook(sheetData, treasurerName) {
  const { label, year, lastDay, beginningBalance, entries, endingBalance } = sheetData
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const monthName = label.split(' ')[0]

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const marginX = 14

  // ── Title block ──────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 22, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('CASHBOOK — CASH IN TREASURY', pageW / 2, 10, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(`Municipality of Dulag  ·  General Fund  ·  ${label}`, pageW / 2, 17, { align: 'center' })

  // Gold accent line
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.8)
  doc.line(marginX, 23, pageW - marginX, 23)

  // ── Table ────────────────────────────────────────────────────
  const tableBody = [
    // Beginning balance row
    [
      { content: '', styles: { fontStyle: 'italic', textColor: DARK_GRAY } },
      { content: 'Beginning Balance', styles: { fontStyle: 'italic', textColor: DARK_GRAY } },
      '',
      '',
      '',
      { content: peso(beginningBalance), styles: { halign: 'right', fontStyle: 'italic' } },
    ],
    // Data rows
    ...entries.map((e) => [
      { content: formatDate(e.dateSerial), styles: { halign: 'center' } },
      e.particulars,
      { content: e.reference, styles: { fontSize: 7, textColor: [100, 100, 100] } },
      { content: e.debit ? peso(e.debit) : '', styles: { halign: 'right' } },
      { content: e.credit ? peso(e.credit) : '', styles: { halign: 'right' } },
      { content: peso(e.balance), styles: { halign: 'right' } },
    ]),
    // Total row
    [
      '',
      { content: 'TOTAL', styles: { halign: 'right', fontStyle: 'bold' } },
      '',
      { content: peso(totalDebit), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: peso(totalCredit), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: peso(endingBalance), styles: { halign: 'right', fontStyle: 'bold' } },
    ],
  ]

  autoTable(doc, {
    startY: 27,
    head: [['Date', 'Particulars', 'Reference', 'Debit', 'Credit', 'Balance']],
    body: tableBody,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35 },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    didParseCell(data) {
      // Style beginning balance row
      if (data.row.index === 0 && data.section === 'body') {
        data.cell.styles.fillColor = [235, 242, 255]
      }
      // Style total row
      if (data.row.index === tableBody.length - 1 && data.section === 'body') {
        data.cell.styles.fillColor = NAVY
        data.cell.styles.textColor = [255, 255, 255]
      }
    },
  })

  // ── Certification ─────────────────────────────────────────────
  const tableEnd = doc.lastAutoTable.finalY + 8
  const pageH = doc.internal.pageSize.getHeight()

  if (tableEnd + 50 > pageH) {
    doc.addPage()
  }

  const certY = tableEnd + 10 > pageH ? 20 : tableEnd

  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.4)
  doc.line(marginX, certY, pageW - marginX, certY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('CERTIFICATION', marginX, certY + 6)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK_GRAY)
  const certText =
    `I hereby certify that the foregoing is a correct and complete record of all my collections, ` +
    `deposits/remittances, and balances of my accounts in the Cash in Treasury as of ${lastDay}.`
  doc.text(certText, marginX, certY + 13, { maxWidth: pageW - marginX * 2 })

  // Signature lines
  const sigY = certY + 28
  const nameX = marginX + 20
  const dateX = pageW - marginX - 60

  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.5)
  doc.line(nameX, sigY, nameX + 80, sigY)
  doc.line(dateX, sigY, dateX + 55, sigY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(treasurerName.toUpperCase(), nameX + 40, sigY - 2, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Municipal Treasurer', nameX + 40, sigY + 4, { align: 'center' })
  doc.text(lastDay, dateX + 27.5, sigY - 2, { align: 'center' })
  doc.text('Date', dateX + 27.5, sigY + 4, { align: 'center' })

  doc.save(`${monthName}_${year}_Cashbook.pdf`)
}
