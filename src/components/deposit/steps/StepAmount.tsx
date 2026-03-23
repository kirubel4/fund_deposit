'use client'

import { useState } from 'react'
import { useDepositStore } from '@/store/deposit.store'

export default function StepAmount() {
  const { amount, setAmount, setStep, mode } = useDepositStore()
  const [val, setVal] = useState(amount ? String(amount) : '')
  const [err, setErr] = useState('')

  function proceed() {
    const n = parseFloat(val)
    if (!val || isNaN(n) || n <= 0) { setErr('Please enter a valid positive amount.'); return }
    setAmount(n)
    setStep(2)
  }

  return (
    <div className="card p-6 space-y-5 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {mode === 'bulk' ? 'Declared Total' : 'Deposit Amount'}
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {mode === 'bulk'
            ? 'Enter the total ETB across all receipts you will submit.'
            : 'How much are you depositing? (ETB)'}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 pointer-events-none">
            ETB
          </span>
          <input
            type="number"
            min="1"
            step="any"
            value={val}
            onChange={(e) => { setVal(e.target.value); setErr('') }}
            onKeyDown={(e) => e.key === 'Enter' && proceed()}
            placeholder="0.00"
            className="input pl-12 text-base font-semibold"
          />
        </div>
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>

      <button onClick={proceed} className="btn-primary w-full">
        Continue
      </button>
    </div>
  )
}
