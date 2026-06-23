import { generateCashbook } from '../utils/generateCashbook.js'

function peso(n) {
  return '₱ ' + (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STAT_CARDS = [
  {
    key: 'beginningBalance',
    label: 'Beginning Balance',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: 'totalDebit',
    label: 'Total Collections',
    color: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: 'totalCredit',
    label: 'Total Deposits',
    color: 'bg-orange-50 border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
  },
  {
    key: 'endingBalance',
    label: 'Ending Balance',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function PreviewStep({ sheet, treasurerName, onBack }) {
  const { label, lastDay, beginningBalance, entries, endingBalance } = sheet
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const preview = entries.slice(0, 5)

  const statValues = { beginningBalance, totalDebit, totalCredit, endingBalance }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Preview — {label}</h2>
        <p className="text-sm text-slate-500">Review the summary before downloading your cashbook.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map(({ key, label: cardLabel, color, iconBg, iconColor, icon }) => (
          <div key={key} className={`stat-card rounded-2xl border p-4 flex items-start gap-3 ${color}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <div className={iconColor}>{icon}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{cardLabel}</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{peso(statValues[key])}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction Preview</p>
          <span className="text-xs text-slate-400">{entries.length} total row{entries.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#1a3557]">
                  <th rowSpan={2} className="px-3 py-2 text-center text-white font-semibold border-r border-blue-400">Date</th>
                  <th rowSpan={2} className="px-3 py-2 text-center text-white font-semibold border-r border-blue-400">Particulars</th>
                  <th rowSpan={2} className="px-3 py-2 text-center text-white font-semibold border-r border-blue-400">Reference</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-white font-semibold">Cash in Treasury</th>
                </tr>
                <tr className="bg-[#1a3557]">
                  <th className="px-3 py-2 text-center text-white font-semibold border-r border-blue-400">Debit</th>
                  <th className="px-3 py-2 text-center text-white font-semibold border-r border-blue-400">Credit</th>
                  <th className="px-3 py-2 text-center text-white font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50 border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-400 italic"></td>
                  <td className="px-3 py-2 text-slate-600 italic font-medium">Beginning Balance</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-700">{peso(beginningBalance)}</td>
                </tr>
                {preview.map((e, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{e.fullDate || '—'}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-[160px] truncate">{e.particulars}</td>
                    <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{e.reference}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{e.debit ? peso(e.debit) : ''}</td>
                    <td className="px-3 py-2 text-right text-orange-600">{e.credit ? peso(e.credit) : ''}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-700">{peso(e.balance)}</td>
                  </tr>
                ))}
                {entries.length > 5 && (
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="px-3 py-2.5 text-center text-xs text-slate-400 italic">
                      +{entries.length - 5} more row{entries.length - 5 > 1 ? 's' : ''} in the downloaded file
                    </td>
                  </tr>
                )}
                <tr className="bg-[#1a3557]">
                  <td className="px-3 py-2.5"></td>
                  <td className="px-3 py-2.5 text-right text-white font-bold">TOTAL</td>
                  <td className="px-3 py-2.5"></td>
                  <td className="px-3 py-2.5 text-right text-emerald-300 font-bold">{peso(totalDebit)}</td>
                  <td className="px-3 py-2.5 text-right text-orange-300 font-bold">{peso(totalCredit)}</td>
                  <td className="px-3 py-2.5 text-right text-amber-300 font-bold">{peso(endingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Certification preview */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Certification</span>
        </div>
        <div className="px-6 py-5 bg-white">
          <p className="text-sm text-slate-600 italic leading-relaxed">
            I hereby certify that the foregoing is a correct and complete record of all my
            collections, deposits/remittances, and balances of my accounts in the Cash in
            Treasury as of <span className="font-semibold not-italic text-slate-800">{lastDay}</span>.
          </p>
          <div className="mt-6 flex justify-between">
            <div className="text-center">
              <div className="border-b-2 border-slate-700 pb-1 px-6 min-w-[160px] font-bold text-sm text-slate-800">
                {treasurerName.toUpperCase() || ' '}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Municipal Treasurer</p>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-slate-700 pb-1 px-6 min-w-[120px] text-sm text-slate-700">
                {lastDay}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={() => generateCashbook(sheet, treasurerName).catch(err => alert('Error generating cashbook: ' + err.message))}
          disabled={!treasurerName.trim()}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-emerald-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .xlsx
        </button>
      </div>
    </div>
  )
}
