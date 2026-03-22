import { create } from 'zustand'

export type PaymentMethod = 'CBE' | 'TELEBIRR' | 'EBIRR' | 'ABYSSINIA' | 'NIB'
export type VerificationMethod = 'LINK' | 'SCREENSHOT' | 'SMS'
export type DepositMode = 'single' | 'bulk'

// Bulk receipt supports either text proof OR a screenshot file
export interface BulkReceipt {
  rawProof: string        // text for SMS/LINK; base64 for SCREENSHOT
  amount: number
  fileName?: string       // display name when screenshot
  isScreenshot?: boolean
  file?: File             // keep the original screenshot for extraction
}

export interface DepositState {
  mode: DepositMode
  step: number
  amount: number | null
  paymentMethod: PaymentMethod | null
  verificationMethod: VerificationMethod | null
  rawProof: string | null
  screenshotFile: File | null
  bulkReceipts: BulkReceipt[]
  declaredTotal: number | null
  result: any | null
  loading: boolean
  error: string | null
  setMode: (m: DepositMode) => void
  setStep: (s: number) => void
  setAmount: (a: number) => void
  setPaymentMethod: (p: PaymentMethod) => void
  setVerificationMethod: (v: VerificationMethod) => void
  setRawProof: (r: string) => void
  setScreenshotFile: (f: File) => void
  addBulkReceipt: (r: BulkReceipt) => void
  removeBulkReceipt: (i: number) => void
  setDeclaredTotal: (t: number) => void
  setResult: (r: any) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

const initial = {
  mode: 'single' as DepositMode,
  step: 1,
  amount: null,
  paymentMethod: null,
  verificationMethod: null,
  rawProof: null,
  screenshotFile: null,
  bulkReceipts: [],
  declaredTotal: null,
  result: null,
  loading: false,
  error: null,
}

export const useDepositStore = create<DepositState>()((set) => ({
  ...initial,
  setMode: (mode) => set({ mode, step: 1 }),
  setStep: (step) => set({ step }),
  setAmount: (amount) => set({ amount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setVerificationMethod: (verificationMethod) => set({ verificationMethod }),
  setRawProof: (rawProof) => set({ rawProof }),
  setScreenshotFile: (screenshotFile) => set({ screenshotFile }),
  addBulkReceipt: (r) => set((s) => ({ bulkReceipts: [...s.bulkReceipts, r] })),
  removeBulkReceipt: (i) =>
    set((s) => ({ bulkReceipts: s.bulkReceipts.filter((_, idx) => idx !== i) })),
  setDeclaredTotal: (declaredTotal) => set({ declaredTotal }),
  setResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}))
