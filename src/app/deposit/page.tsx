'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getRedirectErrorMessage } from '@/lib/token'
import { AlertTriangle, Loader2 } from 'lucide-react'

// ── Auth gate ─────────────────────────────────────────────────────────────────
// Flow:
//  1. External service redirects here with ?ref=<encoded>&sig=<hmac>
//  2. We POST to /api/auth/session which decodes, verifies, and sets cookie
//  3. Redirect to /deposit/portal
//
// If the user already has a valid session cookie (returning visit without
// URL params), we skip straight to the portal.
//
// If params are missing entirely → show "not allowed" message.
// If params are invalid/expired  → show specific error message.
// ─────────────────────────────────────────────────────────────────────────────

function DepositLandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get('ref')
    const sig = searchParams.get('sig')

    async function boot() {
      // No URL params — check if they already have a valid session
      if (!ref || !sig) {
        const check = await fetch('/api/auth/me')
        if (check.ok) {
          router.replace('/deposit/portal')
        } else {
          setError(
            "You're not allowed to access this page directly. " +
            "Please return to HabeshaUnlocker and use the link provided.",
          )
        }
        return
      }

      // Exchange the redirect params for an httpOnly session cookie
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref, sig }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const code = data?.code ?? 'UNKNOWN_ERROR'
          setError(getRedirectErrorMessage(code))
          return
        }

        // Cookie is now set — redirect to portal (clean URL, no params)
        router.replace('/deposit/portal')
      } catch {
        setError(getRedirectErrorMessage('UNKNOWN_ERROR'))
      }
    }

    boot()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="card max-w-sm w-full p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Access Denied</h1>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{error}</p>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_PARENT_APP_URL ?? '#'}
            className="btn-secondary w-full block text-center"
          >
            ← Back to HabeshaUnlocker
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
      <Loader2 size={24} className="text-blue-400 animate-spin" />
      <p className="text-zinc-500 text-sm">Authenticating your session…</p>
    </div>
  )
}

export default function DepositLandingPage() {
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
  )
}
