'use client'

import { useDepositStore } from '@/store/deposit.store'
import { ChevronLeft } from 'lucide-react'
import ModeSelector from './ModeSelector'
import ProgressBar from './ProgressBar'
import StepAmount from './steps/StepAmount'
import StepBank from './steps/StepBank'
import StepVerMethod from './steps/StepVerMethod'
import StepProof from './steps/StepProof'
import StepBulkReceipts from './steps/StepBulkReceipts'
import StepResult from './steps/StepResult'

export default function DepositFlow() {
  const { mode, step, reset, setStep } = useDepositStore()

  return (
    <div className="space-y-5 animate-fade-in">
      {step === 1 && <ModeSelector />}

      {step > 1 && step < 5 && <ProgressBar step={step} total={4} />}

      {step === 1 && <StepAmount />}
      {step === 2 && <StepBank />}
      {step === 3 && <StepVerMethod />}
      {step === 4 && (mode === 'single' ? <StepProof /> : <StepBulkReceipts />)}
      {step === 5 && <StepResult />}

      {step > 1 && step < 5 && (
        <button
          onClick={() => setStep(step - 1)}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
        >
          <ChevronLeft size={14} /> Back
        </button>
      )}

      {step === 5 && (
        <button onClick={reset} className="btn-secondary w-full">
          Start a new deposit
        </button>
      )}
    </div>
  )
}
