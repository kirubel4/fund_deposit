import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PaymentMethod = "CBE" | "TELEBIRR" | "EBIRR" | "ABYSSINIA" | "NIB";
export type VerificationMethod = "LINK" | "SCREENSHOT" | "SMS";
export type DepositMode = "single" | "bulk";

export interface BulkReceipt {
  rawProof: string;
  amount: number;
  fileName?: string;
  isScreenshot?: boolean;
  file?: File;
}

export interface GatewaySession {
  checkoutId: string;
  invoiceId: string;
  amount: number;
  expiresAt?: number; // timestamp ms
}

export interface DepositState {
  mode: DepositMode;
  step: number;
  amount: number | null;
  paymentMethod: PaymentMethod | null;
  verificationMethod: VerificationMethod | null;
  rawProof: string | null;
  screenshotFile: File | null;
  bulkReceipts: BulkReceipt[];
  declaredTotal: number | null;
  result: any | null;
  loading: boolean;
  error: string | null;
  gatewaySession: GatewaySession | null;
  setMode: (m: DepositMode) => void;
  setStep: (s: number) => void;
  setAmount: (a: number) => void;
  setPaymentMethod: (p: PaymentMethod) => void;
  setVerificationMethod: (v: VerificationMethod) => void;
  setRawProof: (r: string) => void;
  setScreenshotFile: (f: File) => void;
  addBulkReceipt: (r: BulkReceipt) => void;
  removeBulkReceipt: (i: number) => void;
  setDeclaredTotal: (t: number) => void;
  setResult: (r: any) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  setGatewaySession: (s: GatewaySession | null) => void;
  reset: () => void;
}

const initial = {
  mode: "single" as DepositMode,
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
  gatewaySession: null,
};

const SESSION_TTL_MS = 20 * 60 * 1000; // 20 minutes

export const useDepositStore = create<DepositState>()(
  persist(
    (set, get) => ({
      ...initial,
      setMode: (mode) => set({ mode, step: 1 }),
      setStep: (step) => set({ step }),
      setAmount: (amount) => set({ amount }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setVerificationMethod: (verificationMethod) =>
        set({ verificationMethod }),
      setRawProof: (rawProof) => set({ rawProof }),
      setScreenshotFile: (screenshotFile) => set({ screenshotFile }),
      addBulkReceipt: (r) =>
        set((s) => ({ bulkReceipts: [...s.bulkReceipts, r] })),
      removeBulkReceipt: (i) =>
        set((s) => ({
          bulkReceipts: s.bulkReceipts.filter((_, idx) => idx !== i),
        })),
      setDeclaredTotal: (declaredTotal) => set({ declaredTotal }),
      setResult: (result) => set({ result }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setGatewaySession: (gatewaySession) => {
        // attach expiry when setting
        if (gatewaySession) {
          set({
            gatewaySession: {
              ...gatewaySession,
              expiresAt: Date.now() + SESSION_TTL_MS,
            },
            amount: gatewaySession.amount,
          });
        } else {
          set({ gatewaySession: null });
        }
      },
      reset: () => set(initial),
    }),
    {
      name: "deposit-gateway-session",
      storage: createJSONStorage(() => sessionStorage),
      // only persist gateway-relevant fields — not loading/error/file state
      partialize: (state) => ({
        gatewaySession: state.gatewaySession,
        amount: state.amount,
        step: state.step,
        mode: state.mode,
      }),
      // on rehydrate, check if session expired
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const s = state.gatewaySession;
        if (s && Date.now() > (s.expiresAt ?? 0)) {
          state.setGatewaySession(null);
          state.reset();
        }
      },
    },
  ),
);
