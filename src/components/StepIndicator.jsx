const STEPS = ['Upload', 'Configure', 'Preview']

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${done ? 'bg-blue-600 border-blue-600 text-white'
                    : active ? 'bg-white border-blue-600 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-400'}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-20 h-0.5 mb-4 mx-1 ${done ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
