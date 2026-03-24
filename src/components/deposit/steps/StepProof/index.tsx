'use client'

import { useState } from 'react'
import { useDepositStore } from '@/store/deposit.store'
import { submitSingleDeposit } from '@/lib/api'
import { buildSingleDepositDto } from '@/lib/depositPayload'
import { fetchExtractedText } from '@/lib/extraction'
import { Loader2 } from 'lucide-react'
import TextProofInput from './TextProofInput'
import ScreenshotUpload from './ScreenshotUpload'
import ErrorBox from '../../ui/ErrorBox'

export default function StepProof() {
  const {
    verificationMethod, paymentMethod, amount,
    setRawProof, setScreenshotFile,
    setResult, setStep, setLoading, setError, loading, error,
  } = useDepositStore()

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [accountNumber, setAccountNumber] = useState('')

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
  }

  async function submit() {
    setError(null)

    if (verificationMethod === 'SCREENSHOT' && !file) {
      setError('Please upload a screenshot.'); return
    }
    if (verificationMethod === 'SCREENSHOT' && !accountNumber.trim()) {
      setError('Please enter your sender account number.'); return
    }
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

      const result = await submitSingleDeposit({
        amount: amount!,
        paymentMethod: paymentMethod!,
        verificationMethod: effectiveMethod,
        rawProof: proofText || undefined,
        accountNumber: accountNumber.trim() || undefined,
      });

      setResult(result)
      setStep(5)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const LABELS: Record<string, { title: string; desc: string }> = {
    LINK:       { title: 'Transaction Link',  desc: 'Paste the transaction URL from your bank app.' },
    SMS:        { title: 'Bank SMS',           desc: 'Paste the full SMS exactly as received — do not edit it.' },
    SCREENSHOT: { title: 'Screenshot',         desc: 'Upload your transaction confirmation screenshot.' },
  }
  const label = LABELS[verificationMethod!] ?? { title: '', desc: '' }

  return (
    <div className="card p-6 space-y-5 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">{label.title}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">{label.desc}</p>
      </div>

      {(verificationMethod === 'SMS' || verificationMethod === 'LINK') && (
        <TextProofInput
          verificationMethod={verificationMethod}
          value={text}
          onChange={(val) => { setText(val); setRawProof(val) }}
        />
      )}

      {verificationMethod === 'SCREENSHOT' && (
        <ScreenshotUpload
          preview={preview}
          fileName={file?.name ?? null}
          onFile={handleFile}
          onClear={clearFile}
          accountNumber={accountNumber}
          onAccountNumberChange={setAccountNumber}
        />
      )}

      {error && <ErrorBox message={error} />}

      <button onClick={submit} disabled={loading} className="btn-primary w-full">
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Verifying…</>
          : 'Submit & Verify'
        }
      </button>
    </div>
  )
}