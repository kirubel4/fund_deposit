"use client";

import { useDepositStore, PaymentMethod } from "@/store/deposit.store";
import { useReceivingAccounts } from "@/lib/queries";
import { Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const BANK_META: Record<string, { tag: string; label: string }> = {
  CBE: { tag: "CBE", label: "CBE Birr" },
  TELEBIRR: { tag: "ETHIO", label: "Telebirr" },
  EBIRR: { tag: "KAAFI", label: "E-Birr" },
  ABYSSINIA: { tag: "BOA", label: "Bank of Abyssinia" },
  NIB: { tag: "NIB", label: "NIB International" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      className="ml-2 p-1 rounded-md hover:bg-zinc-700 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? (
        <Check size={11} className="text-emerald-400" />
      ) : (
        <Copy size={11} className="text-zinc-500" />
      )}
    </button>
  );
}

export default function StepBank() {
  const { paymentMethod, setPaymentMethod, amount, setStep } =
    useDepositStore();

  // ✅ Cached — hits the network once per session (staleTime: Infinity)
  const { data: accounts = [], isLoading, error } = useReceivingAccounts();

  return (
    <div className="space-y-4 stagger">
      <div>
        <h2 className="text-lg font-semibold text-white">Payment Method</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Select a bank — you will see the account to send to.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10 gap-2 text-zinc-500 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading banks…
        </div>
      )}

      {error && (
        <div className="card-sm p-4 text-xs text-red-400 border-red-500/20">
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-2">
          {accounts.map(
            ({ paymentMethod: key, accountNumber, accountName }) => {
              const meta = BANK_META[key] ?? { tag: key, label: key };
              const isSelected = paymentMethod === key;

              return (
                <div
                  key={key}
                  onClick={() => setPaymentMethod(key as PaymentMethod)}
                  className={clsx(
                    "card-sm overflow-hidden cursor-pointer",
                    "hover:border-zinc-600 transition-all duration-150",
                    isSelected ? "border-blue-500" : "",
                  )}
                >
                  <div
                    className={clsx(
                      "flex items-center justify-between px-4 py-3",
                      isSelected ? "bg-blue-500/8" : "",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-zinc-800 text-zinc-400",
                        )}
                      >
                        {meta.tag}
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {meta.label}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-800 px-4 py-3 grid grid-cols-2 gap-y-2">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                        Account Name
                      </p>
                      <p className="text-xs font-medium text-zinc-200">
                        {accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                        Account Number
                      </p>
                      <div className="flex items-center">
                        <p className="text-xs font-mono font-semibold text-zinc-200">
                          {accountNumber}
                        </p>
                        <CopyButton text={accountNumber} />
                      </div>
                    </div>

                    {isSelected && amount && (
                      <div className="col-span-2 mt-1 pt-2 border-t border-zinc-800 flex items-center justify-between">
                        <p className="text-xs text-zinc-500">Send exactly</p>
                        <p className="text-sm font-bold text-blue-400">
                          ETB {amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      <button
        onClick={() => setStep(3)}
        disabled={!paymentMethod || isLoading || accounts.length === 0}
        className="btn-primary w-full"
      >
        Continue
      </button>
    </div>
  );
}
