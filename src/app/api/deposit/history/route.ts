// ── app/api/deposit/history/route.ts ─────────────────────────────────────────
// Proxy: reads httpOnly session cookie → forwards to NestJS as Bearer token.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, verifySessionJwt } from '@/lib/session'

const NESTJS = process.env.NESTJS_API_URL!

export async function GET(req: NextRequest) {
  const jwt = getSessionCookie(req)
  if (!jwt) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })

  try {
    await verifySessionJwt(jwt)
  } catch {
    return NextResponse.json({ message: 'Session expired.' }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const page = searchParams.get('page') ?? '0'
    const pageSize = searchParams.get('pageSize') ?? '10'

    const res = await fetch(`${NESTJS}/api/history?page=${page}&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
