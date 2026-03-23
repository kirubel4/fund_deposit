'use client'

import { useDepositStore } from '@/store/deposit.store'
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

function getMeta(status: string) {
  switch (status) {
    case 'PASS':
      return {
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/5',
        label: 'Verified Successfully',
        note: 'Your deposit has been verified and will be credited shortly.',
        noteColor: 'text-emerald-400',
      }
    case 'AMBIGUOUS':
      return {
        icon: Clock,
        iconColor: 'text-yellow-400',
        border: 'border-yellow-500/20',
        bg: 'bg-yellow-500/5',
        label: 'Under Manual Review',
        note: "One of your receipts couldn't be verified automatically. Our team has been notified and will review it. You'll be notified on Telegram.",
        noteColor: 'text-yellow-400',
      }
    case 'FAIL_RETRYABLE':
      return {
        icon: AlertTriangle,
        iconColor: 'text-orange-400',
        border: 'border-orange-500/20',
        bg: 'bg-orange-500/5',
        label: 'Verification Failed — Retryable',
        note: 'Please check your proof and try again.',
        noteColor: 'text-orange-400',
      }
    default:
      return {
        icon: XCircle,
        iconColor: 'text-red-400',
        border: 'border-red-500/20',
        bg: 'bg-red-500/5',
        label: 'Verification Failed',
        note: null,
        noteColor: 'text-red-400',
      }
  }
}

function Row({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className={clsx('text-xs text-zinc-200 text-right', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  )
}

export default function StepResult() {
  const { result, amount, paymentMethod, mode } = useDepositStore()
  if (!result) return null

  const status = result.status ?? (result.reason ? 'FAIL' : 'PASS')
  const meta = getMeta(status)
  const Icon = meta.icon

  return (
    <div className={clsx('rounded-2xl border p-6 space-y-5 animate-fade-up', meta.border, meta.bg)}>
      {/* Icon + title */}
      <div className="flex items-center gap-3">
        <Icon size={26} className={meta.iconColor} />
        <div>
          <h2 className="text-base font-semibold text-white">{meta.label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === 'bulk' ? 'Bulk' : 'Single'} deposit · {paymentMethod}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-1 divide-y divide-zinc-800">
        {amount && <Row label="Amount" value={`ETB ${amount.toLocaleString()}`} />}
        {result.depositRequestId && <Row label="Reference" value={result.depositRequestId} mono />}
        {result.verifiedReceipts?.length && (
          <Row label="Receipts verified" value={result.verifiedReceipts.length} />
        )}
        {result.failedIndex && (
          <Row label="Failed at receipt" value={`#${result.failedIndex}`} />
        )}
        {result.reason && (
          <Row label="Reason" value={result.reason} />
        )}
      </div>

      {/* Note */}
      {meta.note && (
        <p className={clsx('text-xs leading-relaxed', meta.noteColor)}>
          {meta.note}
        </p>
      )}
    </div>
  )
}
