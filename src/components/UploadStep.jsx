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
        setError('No recognizable month sheets found in this file.')
        setLoading(false)
        return
      }
      onParsed(sheets)
    } catch (e) {
      setError('Failed to parse file. Make sure it is a valid Excel workbook.')
    }
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload Cashbook File</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload <span className="font-mono">Cash_in_treasury_GF.xlsx</span> or any consolidated cashbook workbook.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`w-full max-w-md border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 font-medium">
          {loading ? 'Parsing…' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-gray-400">.xlsx files only</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
