import { useRef, useState } from 'react'
import { parsePDF } from '../utils/parsePDF.js'

export default function UploadStep({ onParsed }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    if (!file.name.match(/\.pdf$/i)) {
      setError('Please upload a PDF file.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const sheets = await parsePDF(file)
      if (sheets.length === 0) {
        setError('No recognizable month data found in this PDF. Make sure it is a digital (searchable) cashbook PDF.')
        setLoading(false)
        return
      }
      onParsed(sheets)
    } catch (e) {
      setError('Failed to read the PDF. Make sure it is not password-protected or a scanned image.')
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
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Upload Cashbook PDF</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        Upload your consolidated cashbook <span className="font-semibold text-slate-700">.pdf</span> file.
        The app will extract the data and generate a COA-compliant Excel file.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current.click()}
        className={`w-full max-w-md rounded-2xl border-2 border-dashed px-8 py-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-red-400 bg-red-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-red-50'}`}
      >
        {loading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-500 animate-spin" />
            <p className="text-slate-600 font-medium">Reading PDF…</p>
            <p className="text-xs text-slate-400">Extracting transaction data</p>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${dragging ? 'bg-red-500' : 'bg-white border border-slate-200 shadow-sm'}`}>
              <svg className={`w-8 h-8 transition-colors ${dragging ? 'text-white' : 'text-slate-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-slate-700 font-semibold">
                {dragging ? 'Drop to upload' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-slate-400 text-sm mt-0.5">or click to browse</p>
            </div>
            <span className="text-xs font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full">
              PDF only
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Info note */}
      <div className="mt-5 flex items-start gap-2 text-xs text-slate-500 max-w-md text-left">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Must be a digital (searchable) PDF — not a scanned image. The app reads text directly from the file.
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md w-full text-left">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
