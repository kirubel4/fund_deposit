// ── app/api/auth/session/route.ts ─────────────────────────────────────────────
// Called by /deposit/page.tsx after the user lands from the external service.
// Decodes the obfuscated URL params, verifies HMAC + timestamp, signs a
// session JWT, and sets it as an httpOnly cookie.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { decodeRedirectParams } from "@/lib/token";
import {
  createSessionJwt,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { ref, sig } = await req.json();

    if (!ref || !sig) {
      return NextResponse.json(
        { code: "MISSING_PARAMS", message: "Missing ref or sig." },
        { status: 400 },
      );
    }

    // Decode + verify: checks HMAC signature and 5-minute timestamp window
    const { userId, email } = await decodeRedirectParams(ref, sig);
 
    // Sign a session JWT and attach it as an httpOnly cookie
    const jwt = await createSessionJwt({ userId, email });
    const response = NextResponse.json({ ok: true, email });
    setSessionCookie(response, jwt);

    return response;
  } catch (err: any) {
    const code = err.message ?? "UNKNOWN_ERROR";
    return NextResponse.json({ code, message: code }, { status: 401 });
  }
}

export async function DELETE(_req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
