export default function ConfigureStep({ sheets, selected, onSelect, treasurerName, onTreasurerName, onBack, onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-1">Configure</h2>
        <p className="text-sm text-gray-500">Select a month and enter the treasurer's name.</p>
      </div>

      {/* Locked fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">LGU</label>
          <input
            readOnly
            value="Municipality of Dulag"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fund</label>
          <input
            readOnly
            value="General Fund"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Month chips */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Select Month</label>
        <div className="flex flex-wrap gap-2">
          {sheets.map((s) => {
            const active = selected?.sheetName === s.sheetName
            return (
              <button
                key={s.sheetName}
                onClick={() => onSelect(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'}`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Treasurer name */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Treasurer's Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={treasurerName}
          onChange={(e) => onTreasurerName(e.target.value)}
          placeholder="e.g. MARIA C. SANTOS"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          onClick={onNext}
          disabled={!selected || !treasurerName.trim()}
          className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Preview →
        </button>
      </div>
    </div>
  )
}
