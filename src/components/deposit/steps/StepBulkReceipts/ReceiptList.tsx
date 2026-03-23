'use client'

import { Trash2, Image } from 'lucide-react'
import clsx from 'clsx'
import type { BulkReceipt } from '@/store/deposit.store'

interface Props {
  receipts: BulkReceipt[]
  declaredTotal: number | null
  onRemove: (index: number) => void
}

export default function ReceiptList({ receipts, declaredTotal, onRemove }: Props) {
  const receiptsTotal = receipts.reduce((s, r) => s + r.amount, 0)
  const overTotal = declaredTotal !== null && receiptsTotal > declaredTotal

  return (
    <div className="space-y-2">
      {receipts.map((r, i) => (
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
            onClick={() => onRemove(i)}
            className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className={clsx(
        'text-xs text-right px-1',
        overTotal ? 'text-red-400' : 'text-zinc-500',
      )}>
        Running total: ETB {receiptsTotal.toFixed(2)}
        {overTotal && ' ⚠ exceeds declared total'}
      </div>
    </div>
  )
}
