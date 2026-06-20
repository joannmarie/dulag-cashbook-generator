import { useRef, useState } from 'react'
import { parseWorkbook } from '../utils/parseWorkbook.js'

export default function UploadStep({ onParsed }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    if (!file.name.match(/\.xlsx$/i)) {
      setError('Please upload an .xlsx file.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const sheets = await parseWorkbook(file)
      if (sheets.length === 0) {
        setError('No recognizable month sheets found. Check that this is the correct cashbook file.')
        setLoading(false)
        return
      }
      onParsed(sheets)
    } catch {
      setError('Failed to read the file. Make sure it is a valid Excel workbook.')
    }
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#1a3557]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Upload Cashbook File</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        Upload your consolidated <span className="font-semibold text-slate-700">Cash_in_treasury_GF.xlsx</span> to get started.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current.click()}
        className={`w-full max-w-md rounded-2xl border-2 border-dashed px-8 py-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-[#1a3557] bg-blue-50 upload-dragging scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-[#1a3557] hover:bg-blue-50'}`}
      >
        {loading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-[#1a3557] animate-spin" />
            <p className="text-slate-600 font-medium">Parsing workbook…</p>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${dragging ? 'bg-[#1a3557]' : 'bg-white border border-slate-200 shadow-sm'}`}>
              <svg className={`w-8 h-8 transition-colors ${dragging ? 'text-white' : 'text-slate-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-slate-700 font-semibold">
                {dragging ? 'Drop to upload' : 'Drag & drop your file here'}
              </p>
              <p className="text-slate-400 text-sm mt-0.5">or click to browse</p>
            </div>
            <span className="text-xs font-medium bg-slate-200 text-slate-500 px-3 py-1 rounded-full">
              .xlsx only
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md w-full text-left">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
