export default function ConfigureStep({ sheets, selected, onSelect, treasurerName, onTreasurerName, onBack, onNext }) {
  // Group sheets by year
  const byYear = sheets.reduce((acc, s) => {
    acc[s.year] = acc[s.year] || []
    acc[s.year].push(s)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Configure Report</h2>
        <p className="text-sm text-slate-500">Select a month and enter the treasurer's name to generate the cashbook.</p>
      </div>

      {/* Locked fields */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'LGU', value: 'Municipality of Dulag' },
          { label: 'Fund', value: 'General Fund' },
        ].map(({ label, value }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-slate-500 font-medium">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Month selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Select Month
        </label>
        <div className="flex flex-col gap-4">
          {Object.entries(byYear).sort().map(([year, yearSheets]) => (
            <div key={year}>
              <p className="text-xs font-bold text-slate-400 mb-2">{year}</p>
              <div className="flex flex-wrap gap-2">
                {yearSheets.map((s) => {
                  const active = selected?.sheetName === s.sheetName
                  const monthName = s.label.split(' ')[0]
                  return (
                    <button
                      key={s.sheetName}
                      onClick={() => onSelect(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                        ${active
                          ? 'bg-[#1a3557] text-white border-[#1a3557] shadow-md shadow-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a3557] hover:text-[#1a3557]'}`}
                    >
                      {monthName}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treasurer name */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Treasurer's Name <span className="text-red-400 normal-case font-normal">(required)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            value={treasurerName}
            onChange={(e) => onTreasurerName(e.target.value)}
            placeholder="e.g. MARIA C. SANTOS"
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3557] focus:border-transparent transition-shadow placeholder:text-slate-300 font-medium"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 ml-1">Will appear on the certification signature line.</p>
      </div>

      {/* Selected summary */}
      {selected && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span className="text-sm text-amber-800 font-medium">
            {selected.label} selected — {selected.entries.length} transaction{selected.entries.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

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
          onClick={onNext}
          disabled={!selected || !treasurerName.trim()}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#1a3557] text-white rounded-xl hover:bg-[#142940] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-200"
        >
          Preview Report
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
