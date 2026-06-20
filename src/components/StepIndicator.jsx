const STEPS = [
  {
    label: 'Upload',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: 'Configure',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    label: 'Download',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export default function StepIndicator({ current }) {
  return (
    <div className="relative flex items-start justify-between">
      {/* Background line */}
      <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 z-0" />
      {/* Progress line */}
      <div
        className="absolute top-5 left-10 h-0.5 bg-amber-400 z-0 transition-all duration-500"
        style={{ width: current === 0 ? '0%' : current === 1 ? '50%' : '100%', right: 'auto' }}
      />

      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex flex-col items-center z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                ${done
                  ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-200'
                  : active
                  ? 'bg-[#1a3557] border-[#1a3557] shadow-md shadow-blue-200'
                  : 'bg-white border-slate-200'}`}
            >
              {done ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className={active ? 'text-white' : 'text-slate-400'}>
                  {step.icon}
                </div>
              )}
            </div>
            <span
              className={`mt-2 text-xs font-semibold uppercase tracking-wider
                ${done ? 'text-amber-600' : active ? 'text-[#1a3557]' : 'text-slate-400'}`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
