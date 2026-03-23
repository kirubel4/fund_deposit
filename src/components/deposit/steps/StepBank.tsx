'use client'

import { useDepositStore, PaymentMethod } from '@/store/deposit.store'
import clsx from 'clsx'

const BANKS: {
  key: PaymentMethod
  label: string
  tag: string
  accountNumber: string
  accountName: string
}[] = [
  {
    key: 'CBE',
    label: 'CBE Birr',
    tag: 'CBE',
    accountNumber: '1000XXXXXXXXX',
    accountName: 'HabeshaUnlocker PLC',
  },
  {
    key: 'TELEBIRR',
    label: 'Telebirr',
    tag: 'ETHIO',
    accountNumber: '09XXXXXXXX',
    accountName: 'HabeshaUnlocker PLC',
  },
  {
    key: 'EBIRR',
    label: 'E-Birr',
    tag: 'KAAFI',
    accountNumber: '09XXXXXXXX',
    accountName: 'HabeshaUnlocker PLC',
  },
  {
    key: 'ABYSSINIA',
    label: 'Bank of Abyssinia',
    tag: 'BOA',
    accountNumber: 'XXXX XXXX XXXX',
    accountName: 'HabeshaUnlocker PLC',
  },
  {
    key: 'NIB',
    label: 'NIB International',
    tag: 'NIB',
    accountNumber: 'XXXX XXXX XXXX',
    accountName: 'HabeshaUnlocker PLC',
  },
]

export default function StepBank() {
  const { paymentMethod, setPaymentMethod, amount, setStep } = useDepositStore()
  const selected = BANKS.find((b) => b.key === paymentMethod) ?? null

  return (
    <div className="space-y-4 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">Payment Method</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Select the bank you will send from.</p>
      </div>

      {/* Account info banner — pinned at top once a bank is selected */}
      {selected && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {selected.tag}
            </div>
            <div>
              <p className="text-xs text-zinc-500">Send to</p>
              <p className="text-sm font-semibold text-white">{selected.accountName}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0.5 pl-11 sm:pl-0">
            <div>
              <p className="text-xs text-zinc-500">Account</p>
              <p className="text-sm font-mono font-semibold text-white">{selected.accountNumber}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-zinc-500">Amount</p>
              <p className="text-sm font-bold text-blue-400">ETB {amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bank list */}
      <div className="space-y-2">
        {BANKS.map(({ key, label, tag }) => (
          <button
            key={key}
            onClick={() => setPaymentMethod(key)}
            className={clsx(
              'w-full card-sm p-4 flex items-center justify-between',
              'hover:border-zinc-600 transition-all duration-150 active:scale-[0.99]',
              paymentMethod === key ? 'border-blue-500 bg-blue-500/5' : '',
            )}
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold',
                paymentMethod === key ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400',
              )}>
                {tag}
              </div>
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
            {paymentMethod === key && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(3)}
        disabled={!paymentMethod}
        className="btn-primary w-full"
      >
        Continue
      </button>
    </div>
  )
}