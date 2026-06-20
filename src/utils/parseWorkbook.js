import * as XLSX from 'xlsx'
import { parseSheetName } from './parseSheetName.js'

const CPQ_RE = /CPQ\s*\d{4}-\d{2}-\d+/i

function cellVal(row, colIdx) {
  const cell = row[colIdx]
  if (cell === undefined || cell === null || cell === '') return null
  const n = typeof cell === 'number' ? cell : parseFloat(cell)
  return isNaN(n) ? null : n
}

function cellStr(row, colIdx) {
  const cell = row[colIdx]
  return cell !== undefined && cell !== null ? String(cell).trim() : ''
}

export function parseWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array', cellDates: false })
        const sheets = []

        for (const sheetName of wb.SheetNames) {
          const info = parseSheetName(sheetName)
          if (!info) continue

          const ws = wb.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

          if (rows.length < 3) continue

          const beginningBalance = cellVal(rows[2], 5) ?? 0
          const entries = []
          let hasInconsistentDates = false

          for (let i = 3; i < rows.length; i++) {
            const row = rows[i]
            const debit = cellVal(row, 3)
            const credit = cellVal(row, 4)
            if (debit === null && credit === null) continue

            const particulars = cellStr(row, 1)
            const cpqMatch = particulars.match(CPQ_RE)
            const reference = cpqMatch ? cpqMatch[0].replace(/\s+/, ' ') : ''

            const rawDate = cellVal(row, 0)
            let dateSerial = rawDate

            entries.push({
              dateSerial,
              particulars,
              reference,
              debit: debit ?? 0,
              credit: credit ?? 0,
            })
          }

          let balance = beginningBalance
          const computed = entries.map((entry) => {
            balance = balance + entry.debit - entry.credit
            return { ...entry, balance }
          })

          const endingBalance = computed.length > 0
            ? computed[computed.length - 1].balance
            : beginningBalance

          sheets.push({
            sheetName,
            ...info,
            beginningBalance,
            entries: computed,
            endingBalance,
            hasInconsistentDates,
          })
        }

        sheets.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })

        resolve(sheets)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}
