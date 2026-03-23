'use client'

import clsx from 'clsx'

type Deposit = {
  id: string
  amount: number
  paymentMethod: string
  status: string
  transactionId: string | null
  rejectionReason: string | null
  createdAt: string
}

const STATUS_META: Record<string, { dot: string; label: string }> = {
  PENDING_RECEIPT:       { dot: 'bg-zinc-500',   label: 'Awaiting receipt' },
  VERIFYING:             { dot: 'bg-blue-400',    label: 'Verifying' },
  VERIFIED:              { dot: 'bg-emerald-400', label: 'Verified' },
  FUNDED:                { dot: 'bg-emerald-400', label: 'Funded' },
  REJECTED_RETRYABLE:    { dot: 'bg-orange-400',  label: 'Rejected — retry' },
  REJECTED_HARD:         { dot: 'bg-red-400',     label: 'Rejected' },
  REJECTED_MAX_RETRIES:  { dot: 'bg-red-400',     label: 'Max retries' },
  PENDING_MANUAL_REVIEW: { dot: 'bg-yellow-400',  label: 'Under review' },
  MANUALLY_APPROVED:     { dot: 'bg-emerald-400', label: 'Approved' },
  MANUALLY_REJECTED:     { dot: 'bg-red-400',     label: 'Rejected by admin' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  dep: Deposit
  index: number
}

export default function DepositCard({ dep, index }: Props) {
  const meta = STATUS_META[dep.status] ?? { dot: 'bg-zinc-600', label: dep.status }

  return (
    <div
      className="card-sm p-4 space-y-3 hover:border-zinc-600 transition-colors animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">
            ETB {dep.amount.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {dep.paymentMethod} · {formatDate(dep.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={clsx('w-1.5 h-1.5 rounded-full', meta.dot)} />
          <span className="text-xs text-zinc-400">{meta.label}</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1">
        {dep.transactionId && (
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider w-16 shrink-0">Tx ID</span>
            <span className="text-xs font-mono text-zinc-400 truncate">{dep.transactionId}</span>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider w-16 shrink-0">Ref</span>
          <span className="text-xs font-mono text-zinc-500 truncate">{dep.id}</span>
        </div>
        {dep.rejectionReason && (
          <div className="flex gap-2 items-start">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider w-16 shrink-0 pt-0.5">Reason</span>
            <span className="text-xs text-red-400">{dep.rejectionReason}</span>
          </div>
        )}
      </div>
    </div>
  )
}
