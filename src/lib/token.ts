// ── lib/token.ts ─────────────────────────────────────────────────────────────
// Handles the obfuscated redirect URL that the external service builds
// when sending the user to this app.
//
// URL shape:  /deposit?ref=<encoded>&sig=<hmac>
//
// "ref" is not obviously readable — it is a base64 of a shuffled, salted
// JSON blob so a user glancing at the URL cannot tell what is inside.
// "sig" is an HMAC-SHA256 over "ref" using URL_SECRET so the payload
// cannot be tampered with even if someone figures out the encoding.
//
// Timestamp is embedded inside the payload. Links expire after 5 minutes.
// ─────────────────────────────────────────────────────────────────────────────

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ── Internal helpers ──────────────────────────────────────────────────────────

function xorShift(str: string, key: number): string {
  return str
    .split("")
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((key + i) % 127)))
    .join("");
}

function toB64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64url");
}

function fromB64(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(sig).toString("base64url");
}

async function verifyHmac(
  data: string,
  sig: string,
  secret: string,
): Promise<boolean> {
  console.log("trying to verify");
  const expected = await hmac(data, secret);
  // Constant-time compare to prevent timing attacks
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

// ── Public: build redirect URL params (called by external service) ────────────
// Returns { ref, sig } — append as query params to your redirect URL.
//
// Usage (external service side):
//   const { ref, sig } = await buildRedirectParams(email, userId)
//   const url = `https://yourapp.com/deposit?ref=${ref}&sig=${sig}`

export async function buildRedirectParams(
  email: string,
  userId: string,
): Promise<{ ref: string; sig: string }> {
  const secret = process.env.URL_SECRET!;

  // Salt makes every URL unique even for the same user
  const salt = Math.random().toString(36).slice(2, 10);

  // Payload: salt prefix + shuffled fields so order is not obvious
  const payload = {
    s: salt,
    b: userId, // 'b' not 'userId' — field names are intentionally cryptic
    c: email, // 'c' not 'email'
    d: Date.now(), // timestamp
  };

  // Encode: JSON → XOR-shift → base64url
  const json = JSON.stringify(payload);
  const shifted = xorShift(json, 0x5a);
  const ref = toB64(shifted);

  // Sign the encoded ref (not the raw JSON)
  const sig = await hmac(ref, secret);

  return { ref, sig };
}

// ── Public: decode + verify redirect params (called by this app) ──────────────
// Returns { email, userId } on success.
// Throws a descriptive error on tamper, expiry, or malformed input.

export async function decodeRedirectParams(
  ref: string,
  sig: string,
): Promise<{ email: string; userId: string }> {
  const secret = process.env.URL_SECRET!;

  // 1. Verify HMAC — reject tampered payloads before doing anything else
  const valid = await verifyHmac(ref, sig, secret);
  if (!valid) {
    console.log("hello");
    throw new Error("INVALID_SIGNATURE");
  }

  // 2. Decode: base64url → reverse XOR-shift → JSON
  let payload: { s: string; b: string; c: string; d: number };
  try {
    const shifted = fromB64(ref);
    const json = xorShift(shifted, 0x5a); // XOR is its own inverse
    payload = JSON.parse(json);
  } catch {
    throw new Error("MALFORMED_PAYLOAD");
  }

  // 3. Timestamp check — must be within the 5-minute window
  const age = Date.now() - payload.d;
  if (age < 0 || age > WINDOW_MS) {
    throw new Error("EXPIRED_TOKEN");
  }

  // 4. Field presence check
  if (!payload.b || !payload.c) {
    throw new Error("INCOMPLETE_PAYLOAD");
  }

  return { userId: payload.b, email: payload.c };
}

// ── Public: human-readable error messages for the UI ─────────────────────────

export function getRedirectErrorMessage(code: string): string {
  switch (code) {
    case "INVALID_SIGNATURE":
      return "This link has been modified and cannot be trusted. Please return to HabeshaUnlocker and try again.";
    case "EXPIRED_TOKEN":
      return "This link has expired. Links are only valid for 5 minutes. Please return to HabeshaUnlocker to get a fresh one.";
    case "MALFORMED_PAYLOAD":
    case "INCOMPLETE_PAYLOAD":
      return "This link is incomplete or corrupted. Please return to HabeshaUnlocker and try again.";
    default:
      return "This link is invalid. Please return to HabeshaUnlocker and try again.";
  }
}
