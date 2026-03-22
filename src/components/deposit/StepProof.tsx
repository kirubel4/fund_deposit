'use client'

import { useState, useRef } from 'react'
import { useDepositStore } from '@/store/deposit.store'
import { submitSingleDeposit } from '@/lib/api'
import { buildSingleDepositDto } from '@/lib/depositPayload'
import { fetchExtractedText } from '@/lib/extraction'
import { Upload, Loader2, X } from 'lucide-react'
import clsx from 'clsx'

export default function StepProof() {
  const {
    verificationMethod, paymentMethod, amount,
    setRawProof, setScreenshotFile,
    setResult, setStep, setLoading, setError, loading, error,
  } = useDepositStore()

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setScreenshotFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit() {
    setError(null)
    if (verificationMethod === 'SCREENSHOT' && !file) { setError('Please upload a screenshot.'); return }
    if ((verificationMethod === 'SMS' || verificationMethod === 'LINK') && !text.trim()) {
      setError('Please paste the required text.'); return
    }
    setLoading(true)
    try {
      let proofText = text.trim()
      let effectiveMethod = verificationMethod!
      if (verificationMethod === 'SCREENSHOT' && file) {
        try {
          proofText = await fetchExtractedText(file, file.name)
          effectiveMethod = 'SMS'
        } catch (err: any) {
          setError(err?.message ?? 'Failed to read the screenshot. Please try again.')
          return
        }
      }
      const singlePayload = buildSingleDepositDto({
        amount: amount!,
        paymentMethod: paymentMethod!,
        verificationMethod: effectiveMethod,
        rawProof: proofText || null,
      })
      console.log('SingleDepositDto payload ready for integration:', singlePayload)
      if (verificationMethod === 'SCREENSHOT' && file) {
        console.log('Screenshot file ready for upload:', { name: file.name, size: file.size })
        console.log('Extracted SMS proof:', proofText)
      }
      const result = await submitSingleDeposit({
        amount: amount!,
        paymentMethod: paymentMethod!,
        verificationMethod: effectiveMethod,
        rawProof: proofText || undefined,
        screenshotFile: file ?? undefined,
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
    <div className="card p-6 space-y-5 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {verificationMethod === 'LINK' && 'Transaction Link'}
          {verificationMethod === 'SMS' && 'Bank SMS'}
          {verificationMethod === 'SCREENSHOT' && 'Screenshot'}
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {verificationMethod === 'LINK' && 'Paste the transaction URL from your bank app.'}
          {verificationMethod === 'SMS' && 'Paste the full SMS exactly as received — do not edit it.'}
          {verificationMethod === 'SCREENSHOT' && 'Upload your transaction confirmation screenshot.'}
        </p>
      </div>

      {/* SMS / Link input */}
      {(verificationMethod === 'SMS' || verificationMethod === 'LINK') && (
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setRawProof(e.target.value) }}
          rows={verificationMethod === 'SMS' ? 5 : 2}
          placeholder={verificationMethod === 'SMS' ? 'Paste full SMS here…' : 'https://…'}
          className="input resize-none font-mono text-xs leading-relaxed"
        />
      )}

      {/* Screenshot upload */}
      {verificationMethod === 'SCREENSHOT' && (
        <>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
              <img src={preview} alt="Preview" className="w-full object-contain max-h-56" />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
              >
                <X size={13} className="text-zinc-300" />
              </button>
              <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800">
                <p className="text-xs text-zinc-400 truncate">{file?.name}</p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors duration-150',
                dragOver
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-zinc-700 hover:border-zinc-500',
              )}
            >
              <Upload size={22} className="text-zinc-500" />
              <div className="text-center">
                <p className="text-sm text-zinc-300">Drop image here or click to browse</p>
                <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10 MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button onClick={submit} disabled={loading} className="btn-primary w-full">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Verifying…</> : 'Submit & Verify'}
      </button>
    </div>
  )
}
