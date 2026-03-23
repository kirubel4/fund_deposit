// ── app/api/deposit/route.ts ──────────────────────────────────────────────────
// Proxy: reads httpOnly session cookie → forwards to NestJS as Bearer token.
// The NestJS URL and the session JWT never reach the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, verifySessionJwt } from '@/lib/session'

const NESTJS = process.env.NESTJS_API_URL!

export async function POST(req: NextRequest) {
  const jwt = getSessionCookie(req)
  if (!jwt) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })

  try {
    await verifySessionJwt(jwt) // validate before forwarding
  } catch {
    return NextResponse.json({ message: 'Session expired.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const res = await fetch(`${NESTJS}/api/deposit/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
