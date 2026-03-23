// ── app/api/auth/me/route.ts ──────────────────────────────────────────────────
// Returns the authenticated user's identity by reading and verifying the
// httpOnly session cookie. No token is ever read from the client.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, verifySessionJwt } from '@/lib/session'

export async function GET(req: NextRequest) {
  const jwt = getSessionCookie(req)

  if (!jwt) {
    return NextResponse.json({ message: 'No session.' }, { status: 401 })
  }

  try {
    const { userId, email } = await verifySessionJwt(jwt)
    return NextResponse.json({ userId, email })
  } catch {
    return NextResponse.json({ message: 'Session expired or invalid.' }, { status: 401 })
  }
}
