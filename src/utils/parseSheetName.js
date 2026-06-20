const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, march: 3, apr: 4, may: 5,
  jun: 6, june: 6, jul: 7, july: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function lastDayOfMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

export function parseSheetName(name) {
  if (!name || name.toLowerCase() === 'sheet1') return null

  const clean = name.trim().replace(/\s*\(\d+\)\s*$/, '')
  const match = clean.match(/^([a-zA-Z]+)[-_](\d{2})$/)
  if (!match) return null

  const monthKey = match[1].toLowerCase()
  const yearShort = parseInt(match[2], 10)
  const month = MONTH_MAP[monthKey]
  if (!month) return null

  const year = 2000 + yearShort
  const last = lastDayOfMonth(month, year)
  const monthName = MONTH_NAMES[month]

  return {
    label: `${monthName} ${year}`,
    month,
    year,
    lastDay: `${monthName} ${last}, ${year}`,
  }
}
