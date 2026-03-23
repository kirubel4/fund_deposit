'use client'

import { useDepositStore, type BulkReceipt } from '@/store/deposit.store'
import { submitBulkDeposit } from '@/lib/api'
import { buildBulkDepositDto } from '@/lib/depositPayload'
import { fetchExtractedText, base64ToBlob } from '@/lib/extraction'
import { Loader2 } from 'lucide-react'
import ReceiptList from './ReceiptList'
import AddReceiptForm from './AddReceiptForm'
import ErrorBox from '../../ui/ErrorBox'

async function extractTextForReceipt(receipt: BulkReceipt): Promise<string> {
  const base64Blob = receipt.rawProof ? base64ToBlob(receipt.rawProof) : null
  const source = receipt.file ?? base64Blob
  if (!source) return receipt.rawProof ?? ''
  return fetchExtractedText(source, receipt.fileName ?? 'receipt.png')
}

export default function StepBulkReceipts() {
  const {
    verificationMethod, paymentMethod, amount: declaredTotal,
    bulkReceipts, addBulkReceipt, removeBulkReceipt,
    setResult, setStep, setLoading, setError, loading, error,
  } = useDepositStore()

  async function submit() {
    setError(null)
    if (bulkReceipts.length === 0) { setError('Add at least one receipt.'); return }

    setLoading(true)
    try {
      let preparedReceipts = bulkReceipts
      let effectiveMethod = verificationMethod!

      if (verificationMethod === 'SCREENSHOT') {
        preparedReceipts = await Promise.all(
          bulkReceipts.map(async (r) => {
            if (!r.isScreenshot) return r
            const extracted = await extractTextForReceipt(r)
            return { ...r, rawProof: extracted || r.rawProof }
          }),
        )
        effectiveMethod = 'SMS'
      }

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
      <div>
        <h2 className="text-lg font-semibold text-white">Add Receipts</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Declared total:{' '}
          <span className="text-white font-semibold">ETB {declaredTotal?.toLocaleString()}</span>
        </p>
      </div>

      {bulkReceipts.length > 0 && (
        <ReceiptList
          receipts={bulkReceipts}
          declaredTotal={declaredTotal}
          onRemove={removeBulkReceipt}
        />
      )}

      <AddReceiptForm
        receiptNumber={bulkReceipts.length + 1}
        verificationMethod={verificationMethod!}
        onAdd={addBulkReceipt}
      />

      {error && <ErrorBox message={error} />}

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
