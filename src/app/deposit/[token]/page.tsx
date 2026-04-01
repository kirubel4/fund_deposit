"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Suspense } from "react";
import { getCheckoutErrorMessage } from "@/lib/token";
import { useDepositStore } from "@/store/deposit.store";
import { AlertTriangle, Loader2 } from "lucide-react";

function DepositLandingContent() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const { setAmount, setGatewaySession } = useDepositStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(getCheckoutErrorMessage(data?.code ?? "UNKNOWN_ERROR"));
          return;
        }

        const data = await res.json();
        console.log(data);
        setAmount(data.amount);
        setGatewaySession({
          checkoutId: data.checkoutId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          clientId: data.clientId,
        });

        router.replace("/deposit/portal");
      } catch {
        setError(getCheckoutErrorMessage("UNKNOWN_ERROR"));
      }
    }

    boot();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="card max-w-sm w-full p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Access Denied</h1>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              {error}
            </p>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_PARENT_APP_URL ?? "#"}
            className="btn-secondary w-full block text-center"
          >
            ← Back to HostServer
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
      <Loader2 size={24} className="text-blue-400 animate-spin" />
      <p className="text-zinc-500 text-sm">Authenticating your session…</p>
    </div>
  );
}

export default function DepositTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      }
    >
      <DepositLandingContent />
    </Suspense>
  );
}
