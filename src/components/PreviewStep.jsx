import { generateCashbook } from '../utils/generateCashbook.js'

function peso(n) {
  return '₱ ' + (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-lg font-bold text-gray-800">{peso(value)}</span>
    </div>
  )
}

export default function PreviewStep({ sheet, treasurerName, onBack }) {
  const { label, lastDay, beginningBalance, entries, endingBalance } = sheet
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const preview = entries.slice(0, 5)

  function handleDownload() {
    generateCashbook(sheet, treasurerName)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-1">Preview — {label}</h2>
        <p className="text-sm text-gray-500">Review before downloading.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Beginning Balance" value={beginningBalance} color="bg-blue-50 border-blue-100" />
        <StatCard label="Total Collections" value={totalDebit} color="bg-green-50 border-green-100" />
        <StatCard label="Total Deposits" value={totalCredit} color="bg-orange-50 border-orange-100" />
        <StatCard label="Ending Balance" value={endingBalance} color="bg-purple-50 border-purple-100" />
      </div>

      {/* Table preview */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#185FA5] text-white">
              {['Date', 'Particulars', 'Reference', 'Debit', 'Credit', 'Balance'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 italic text-gray-500">
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2">Beginning Balance</td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-right">{peso(beginningBalance)}</td>
            </tr>
            {preview.map((e, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 whitespace-nowrap">{e.dateSerial ? `—` : ''}</td>
                <td className="px-3 py-2 max-w-xs truncate">{e.particulars}</td>
                <td className="px-3 py-2">{e.reference}</td>
                <td className="px-3 py-2 text-right">{e.debit ? peso(e.debit) : ''}</td>
                <td className="px-3 py-2 text-right">{e.credit ? peso(e.credit) : ''}</td>
                <td className="px-3 py-2 text-right">{peso(e.balance)}</td>
              </tr>
            ))}
            {entries.length > 5 && (
              <tr className="bg-gray-50 text-gray-400">
                <td colSpan={6} className="px-3 py-2 text-center text-xs italic">
                  … {entries.length - 5} more row{entries.length - 5 > 1 ? 's' : ''} not shown
                </td>
              </tr>
            )}
            <tr className="bg-gray-200 font-bold">
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-right">TOTAL</td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-right">{peso(totalDebit)}</td>
              <td className="px-3 py-2 text-right">{peso(totalCredit)}</td>
              <td className="px-3 py-2 text-right">{peso(endingBalance)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Certification block */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-2">CERTIFICATION</p>
        <p className="italic leading-relaxed">
          I hereby certify that the foregoing is a correct and complete record of all my
          collections, deposits/remittances, and balances of my accounts in the Cash in
          Treasury as of <span className="font-medium not-italic">{lastDay}</span>.
        </p>
        <div className="mt-6 flex justify-between text-sm">
          <div className="text-center">
            <div className="border-b border-gray-700 pb-1 px-8 font-semibold">{treasurerName.toUpperCase()}</div>
            <div className="text-xs text-gray-500 mt-1">Municipal Treasurer</div>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-700 pb-1 px-8">{lastDay}</div>
            <div className="text-xs text-gray-500 mt-1">Date</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleDownload}
          disabled={!treasurerName.trim()}
          className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .xlsx
        </button>
      </div>
    </div>
  )
}
