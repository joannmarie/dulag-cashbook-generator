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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Cashbook Generator</h1>
          <p className="text-sm text-gray-500 mt-1">Municipality of Dulag · General Fund</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <StepIndicator current={step} />

          {step === 0 && (
            <UploadStep onParsed={handleParsed} />
          )}

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

        <p className="text-center text-xs text-gray-400 mt-6">
          COA/BLGF-compliant · All processing in browser · No data uploaded
        </p>
      </div>
    </div>
  )
}
