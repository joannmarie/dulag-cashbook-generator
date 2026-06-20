import { useState } from 'react'
import StepIndicator from './components/StepIndicator.jsx'
import UploadStep from './components/UploadStep.jsx'
import ConfigureStep from './components/ConfigureStep.jsx'
import PreviewStep from './components/PreviewStep.jsx'

export default function App() {
  const [step, setStep] = useState(0)
  const [sheets, setSheets] = useState([])
  const [selected, setSelected] = useState(null)
  const [treasurerName, setTreasurerName] = useState('')

  function handleParsed(parsedSheets) {
    setSheets(parsedSheets)
    setSelected(null)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="bg-[#1a3557] rounded-t-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-5 px-8 py-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-400 border-4 border-amber-300 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-[#1a3557]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm14 1l-1.5-1.5L17 13l3.5 3.5L17 20l-1.5-1.5L17 17h-4v-2h4l-1.5-1.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Republic of the Philippines</p>
              <h1 className="text-white font-bold text-xl leading-tight">Municipality of Dulag</h1>
              <p className="text-amber-300 text-sm font-medium">Municipal Treasurer's Office · General Fund</p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <span className="inline-block bg-amber-400 text-[#1a3557] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Cashbook Generator
              </span>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
        </div>

        {/* Card body */}
        <div className="bg-white rounded-b-2xl shadow-xl px-8 py-8">
          <StepIndicator current={step} />

          <div className="mt-8">
            {step === 0 && <UploadStep onParsed={handleParsed} />}
            {step === 1 && (
              <ConfigureStep
                sheets={sheets}
                selected={selected}
                onSelect={setSelected}
                treasurerName={treasurerName}
                onTreasurerName={setTreasurerName}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && selected && (
              <PreviewStep
                sheet={selected}
                treasurerName={treasurerName}
                onBack={() => setStep(1)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            COA / BLGF Compliant
          </span>
          <span className="text-slate-300">·</span>
          <span>All processing done in your browser</span>
          <span className="text-slate-300">·</span>
          <span>No data sent to any server</span>
        </div>
      </div>
    </div>
  )
}
