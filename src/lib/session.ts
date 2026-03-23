// ── lib/session.ts ────────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "hu-sid";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface SessionPayload {
  userId: string;
  email: string;
}

// ── Shared utils ─────────────────────────────────────────────────────────────

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function b64url(buf: ArrayBuffer | Uint8Array): string {
  return Buffer.from(buf as ArrayBuffer).toString("base64url");
}

function fromB64url(str: string): ArrayBuffer {
  const buf = Buffer.from(str, "base64url");

  // ✅ return a REAL ArrayBuffer (not ArrayBufferLike)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ── Crypto key ───────────────────────────────────────────────────────────────

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET??"12345687654312345";
  if (!secret) throw new Error("SESSION_SECRET env var is not set");

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"],
  );
}

// ── Create JWT ───────────────────────────────────────────────────────────────

export async function createSessionJwt(
  payload: SessionPayload,
): Promise<string> {
  try {
    console.log("createSessionJwt called");
    const header = b64url(
      encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    );

    const body = b64url(
      encoder.encode(
        JSON.stringify({
          ...payload,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        }),
      ),
    );

    const data = `${header}.${body}`;

    const key = await getSigningKey();

    const signature = await crypto.subtle.sign(
      { name: "HMAC" }, // ✅ correct syntax
      key,
      encoder.encode(data),
    );

    return `${data}.${b64url(signature)}`;
  } catch (error) {
    console.log("hiii");
    throw Error(error as any);
  }
}

// ── Verify JWT ───────────────────────────────────────────────────────────────

export async function verifySessionJwt(token: string): Promise<SessionPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("INVALID_JWT");

  const [header, body, sigPart] = parts;
  const data = `${header}.${body}`;

  const key = await getSigningKey();
  const valid = await crypto.subtle.verify(
    { name: "HMAC" },
    key,
    fromB64url(sigPart), // ✅ now valid BufferSource
    encoder.encode(data),
  );

  if (!valid) throw new Error("INVALID_JWT_SIGNATURE");

  let claims: SessionPayload & { exp: number };

  try {
    claims = JSON.parse(decoder.decode(fromB64url(body)));
  } catch {
    throw new Error("MALFORMED_JWT");
  }

  if (claims.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("EXPIRED_JWT");
  }

  if (!claims.userId || !claims.email) {
    throw new Error("INCOMPLETE_JWT");
  }

  return {
    userId: claims.userId,
    email: claims.email,
  };
}

// ── Cookies ──────────────────────────────────────────────────────────────────

export function setSessionCookie(response: NextResponse, jwt: string): void {
  response.cookies.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function getSessionCookie(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

// ── Server session (App Router) ──────────────────────────────────────────────

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get(SESSION_COOKIE)?.value;
    if (!jwt) return null;

    return await verifySessionJwt(jwt);
  } catch {
    return null;
  }
}
