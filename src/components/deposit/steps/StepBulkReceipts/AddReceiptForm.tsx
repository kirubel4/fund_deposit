'use client'

import { useState, useRef } from 'react'
import { Plus, Upload, X } from 'lucide-react'
import clsx from 'clsx'
import type { BulkReceipt, VerificationMethod } from '@/store/deposit.store'
import ErrorBox from '../../ui/ErrorBox'

interface Props {
  receiptNumber: number
  verificationMethod: VerificationMethod
  onAdd: (receipt: BulkReceipt) => void
}

export default function AddReceiptForm({ receiptNumber, verificationMethod, onAdd }: Props) {
  const isScreenshot = verificationMethod === 'SCREENSHOT'

  const [draftAmount, setDraftAmount] = useState('')
  const [draftProof, setDraftProof] = useState('')
  const [draftFile, setDraftFile] = useState<File | null>(null)
  const [draftPreview, setDraftPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setDraftFile(f)
    setErr('')
    const reader = new FileReader()
    reader.onload = (e) => setDraftPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  function clearFile() {
    setDraftFile(null)
    setDraftPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function add() {
    setErr('')
    const n = parseFloat(draftAmount)
    if (isNaN(n) || n <= 0) { setErr('Enter a valid amount.'); return }

    if (isScreenshot) {
      if (!draftFile || !draftPreview) { setErr('Please upload a screenshot.'); return }
      const base64 = draftPreview.split(',')[1] ?? draftPreview
      onAdd({ rawProof: base64, amount: n, fileName: draftFile.name, isScreenshot: true, file: draftFile })
      clearFile()
    } else {
      if (!draftProof.trim()) { setErr('Please paste the proof text.'); return }
      onAdd({ rawProof: draftProof.trim(), amount: n })
      setDraftProof('')
    }

    setDraftAmount('')
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        Receipt #{receiptNumber}
      </p>

      {/* Amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 pointer-events-none">
          ETB
        </span>
        <input
          type="number"
          min="1"
          value={draftAmount}
          onChange={(e) => setDraftAmount(e.target.value)}
          placeholder="Amount"
          className="input pl-12 text-sm"
        />
      </div>

      {/* Screenshot upload */}
      {isScreenshot && (
        <>
          {draftPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
              <img src={draftPreview} alt="Preview" className="w-full object-contain max-h-40" />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800"
              >
                <X size={11} className="text-zinc-300" />
              </button>
              <div className="px-3 py-1.5 bg-zinc-900 border-t border-zinc-800">
                <p className="text-xs text-zinc-400 truncate">{draftFile?.name}</p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors',
                dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500',
              )}
            >
              <Upload size={18} className="text-zinc-500" />
              <p className="text-xs text-zinc-400">Drop screenshot or click to browse</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </>
      )}

      {/* SMS / Link textarea */}
      {!isScreenshot && (
        <textarea
          value={draftProof}
          onChange={(e) => setDraftProof(e.target.value)}
          rows={3}
          placeholder={verificationMethod === 'SMS' ? 'Paste full SMS text…' : 'Paste transaction link…'}
          className="input resize-none font-mono text-xs"
        />
      )}

      {err && <ErrorBox message={err} />}

      <button onClick={add} className="btn-secondary w-full">
        <Plus size={14} /> Add Receipt
      </button>
    </div>
  )
}
