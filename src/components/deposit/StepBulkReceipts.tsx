'use client'

import { useState, useRef } from 'react'
import { useDepositStore, type BulkReceipt } from '@/store/deposit.store'
import { submitBulkDeposit } from '@/lib/api'
import { buildBulkDepositDto } from '@/lib/depositPayload'
import { fetchExtractedText, base64ToBlob } from '@/lib/extraction'
import { Trash2, Plus, Loader2, Upload, X, Image } from 'lucide-react'
import clsx from 'clsx'

export default function StepBulkReceipts() {
  const {
    verificationMethod, paymentMethod, amount: declaredTotal,
    bulkReceipts, addBulkReceipt, removeBulkReceipt,
    setResult, setStep, setLoading, setError, loading, error,
  } = useDepositStore()

  const isScreenshot = verificationMethod === 'SCREENSHOT'

  // Draft state
  const [draftProof, setDraftProof] = useState('')
  const [draftAmount, setDraftAmount] = useState('')
  const [draftFile, setDraftFile] = useState<File | null>(null)
  const [draftPreview, setDraftPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [addErr, setAddErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDraftFile(f: File) {
    setDraftFile(f)
    setAddErr('')
    const reader = new FileReader()
    reader.onload = (e) => setDraftPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  function clearDraftFile() {
    setDraftFile(null)
    setDraftPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function extractTextForReceipt(receipt: BulkReceipt) {
    const base64Blob = receipt.rawProof ? base64ToBlob(receipt.rawProof) : null
    const source = receipt.file ?? base64Blob
    if (!source) return receipt.rawProof ?? ''
    return fetchExtractedText(source, receipt.fileName ?? 'receipt.png')
  }

  function addReceipt() {
    setAddErr('')
    const n = parseFloat(draftAmount)
    if (isNaN(n) || n <= 0) { setAddErr('Enter a valid amount.'); return }

    if (isScreenshot) {
      if (!draftFile || !draftPreview) { setAddErr('Please upload a screenshot.'); return }
      // Store base64 (strip the data:image/...;base64, prefix for rawProof)
      const base64 = draftPreview.split(',')[1] ?? draftPreview
      addBulkReceipt({
        rawProof: base64,
        amount: n,
        fileName: draftFile.name,
        isScreenshot: true,
        file: draftFile,
      })
      setDraftFile(null)
      setDraftPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } else {
      if (!draftProof.trim()) { setAddErr('Please paste the proof text.'); return }
      addBulkReceipt({ rawProof: draftProof.trim(), amount: n })
      setDraftProof('')
    }
    setDraftAmount('')
  }

  const receiptsTotal = bulkReceipts.reduce((s, r) => s + r.amount, 0)
  const overTotal = declaredTotal !== null && receiptsTotal > declaredTotal

  async function submit() {
    setError(null)
    if (bulkReceipts.length === 0) { setError('Add at least one receipt.'); return }
    setLoading(true)
    try {
      let preparedReceipts = bulkReceipts
      let effectiveMethod = verificationMethod!
      if (verificationMethod === 'SCREENSHOT') {
        preparedReceipts = await Promise.all(
          bulkReceipts.map(async (receipt) => {
            if (!receipt.isScreenshot) return receipt
            const extracted = await extractTextForReceipt(receipt)
            return { ...receipt, rawProof: extracted || receipt.rawProof }
          }),
        )
        effectiveMethod = 'SMS'
      }
      const bulkPayload = buildBulkDepositDto({
        declaredTotal: declaredTotal!,
        paymentMethod: paymentMethod!,
        verificationMethod: effectiveMethod,
        receipts: preparedReceipts,
      })
      console.log('BulkDepositDto payload ready for integration:', bulkPayload)
      const result = await submitBulkDeposit({
        declaredTotal: declaredTotal!,
        paymentMethod: paymentMethod!,
        verificationMethod: effectiveMethod,
        receipts: preparedReceipts,
      })
      setResult(result)
      setStep(5)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Add Receipts</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Declared total:{' '}
          <span className="text-white font-semibold">ETB {declaredTotal?.toLocaleString()}</span>
        </p>
      </div>

      {/* Collected receipts */}
      {bulkReceipts.length > 0 && (
        <div className="space-y-2">
          {bulkReceipts.map((r, i) => (
            <div key={i} className="card-sm p-3 flex items-center gap-3">
              {r.isScreenshot ? (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <Image size={14} className="text-blue-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400">
                  {i + 1}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">
                  Receipt {i + 1} — ETB {r.amount.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 truncate mt-0.5">
                  {r.isScreenshot ? r.fileName : r.rawProof.slice(0, 55) + '…'}
                </div>
              </div>
              <button
                onClick={() => removeBulkReceipt(i)}
                className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Running total */}
          <div className={clsx(
            'text-xs text-right px-1',
            overTotal ? 'text-red-400' : 'text-zinc-500',
          )}>
            Running total: ETB {receiptsTotal.toFixed(2)}
            {overTotal && ' ⚠ exceeds declared total'}
          </div>
        </div>
      )}

      {/* Add receipt form */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          Receipt #{bulkReceipts.length + 1}
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
                  onClick={clearDraftFile}
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
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) handleDraftFile(f)
                }}
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
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDraftFile(f) }}
            />
          </>
        )}

        {/* SMS / Link textarea */}
        {!isScreenshot && (
          <textarea
            value={draftProof}
            onChange={(e) => setDraftProof(e.target.value)}
            rows={3}
            placeholder={
              verificationMethod === 'SMS'
                ? 'Paste full SMS text…'
                : 'Paste transaction link…'
            }
            className="input resize-none font-mono text-xs"
          />
        )}

        {addErr && <p className="text-xs text-red-400">{addErr}</p>}

        <button
          onClick={addReceipt}
          className="btn-secondary w-full"
        >
          <Plus size={14} /> Add Receipt
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || bulkReceipts.length === 0}
        className="btn-primary w-full"
      >
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Verifying all…</>
          : `Submit ${bulkReceipts.length} Receipt${bulkReceipts.length !== 1 ? 's' : ''}`
        }
      </button>
    </div>
  )
}
