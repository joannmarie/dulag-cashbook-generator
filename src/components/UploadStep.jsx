import { useRef, useState } from 'react'
import { parseRCDFile, groupByMonth } from '../utils/parsePDF.js'

function FileRow({ file, status, count, error }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
      {status === 'parsing' && (
        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
      )}
      {status === 'done' && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
          {count} RCD{count !== 1 ? 's' : ''}
        </span>
      )}
      {status === 'error' && (
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
          Error
        </span>
      )}
    </div>
  )
}

export default function UploadStep({ onParsed }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileStates, setFileStates] = useState([])
  const [processing, setProcessing] = useState(false)
  const [globalError, setGlobalError] = useState('')

  function updateFileState(idx, patch) {
    setFileStates(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f))
  }

  async function processFiles(files) {
    const pdfs = Array.from(files).filter(f => f.name.match(/\.pdf$/i))
    if (!pdfs.length) {
      setGlobalError('Please upload PDF files only.')
      return
    }

    setGlobalError('')
    setProcessing(true)
    const states = pdfs.map(f => ({ file: f, status: 'parsing', count: 0, error: '' }))
    setFileStates(states)

    const allEntries = []

    await Promise.all(pdfs.map(async (file, idx) => {
      try {
        const entries = await parseRCDFile(file)
        if (!entries.length) {
          updateFileState(idx, { status: 'error', error: 'No RCD data found' })
        } else {
          updateFileState(idx, { status: 'done', count: entries.length })
          allEntries.push(...entries)
        }
      } catch {
        updateFileState(idx, { status: 'error', error: 'Parse failed' })
      }
    }))

    setProcessing(false)

    if (!allEntries.length) {
      setGlobalError('Could not extract any RCD data. Make sure the PDFs are digital (not scanned).')
      return
    }

    const grouped = groupByMonth(allEntries)
    onParsed(grouped)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h6M9 17h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Upload RCD Files</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Upload one or more <span className="font-semibold text-slate-700">Report of Collections and Deposits</span> PDFs.
        Each file becomes one row in the cashbook.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !processing && inputRef.current.click()}
        className={`w-full max-w-md rounded-2xl border-2 border-dashed px-8 py-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200
          ${dragging ? 'border-red-400 bg-red-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-red-50'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
          ${dragging ? 'bg-red-500' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <svg className={`w-7 h-7 ${dragging ? 'text-white' : 'text-slate-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-slate-700 font-semibold">
            {dragging ? 'Drop files here' : 'Drag & drop RCD PDFs here'}
          </p>
          <p className="text-slate-400 text-sm mt-0.5">or click to browse — select multiple files</p>
        </div>
        <span className="text-xs font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full">
          PDF files only · multiple allowed
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {fileStates.length > 0 && (
        <div className="mt-5 w-full max-w-md flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left mb-1">
            {processing ? 'Parsing files…' : 'Files processed'}
          </p>
          {fileStates.map((fs, i) => (
            <FileRow key={i} {...fs} />
          ))}
        </div>
      )}

      {globalError && (
        <div className="mt-4 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md w-full text-left">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {globalError}
        </div>
      )}

      {/* Info note */}
      <div className="mt-5 flex items-start gap-2 text-xs text-slate-500 max-w-md text-left">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Each RCD PDF becomes one row: date, CPQ reference, grand total collection (debit), and deposit (credit).
      </div>
    </div>
  )
}
