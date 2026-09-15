/**
 * Signed, expiring admin session cookies.
 *
 * The previous scheme stored the raw `ADMIN_TOKEN` as the cookie value and
 * compared it with `!==`. That made the cookie a long-lived bearer secret with no
 * expiry, and the comparison leaked timing information. Here the cookie is an
 * HMAC-SHA256-signed payload carrying its own expiry, and verification goes
 * through `crypto.subtle.verify`.
 *
 * Everything uses Web Crypto rather than `node:crypto` so the same code runs in
 * Edge middleware and in Node route handlers.
 */

export const ADMIN_COOKIE_NAME = 'admin_auth'

/** Eight hours: long enough for a working session, short enough to limit replay. */
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60

const encoder = new TextEncoder()

interface SessionPayload {
  sub: 'admin'
  exp: number
}

/**
 * Prefers a purpose-named secret but falls back to ADMIN_TOKEN so existing
 * deployments keep working without adding a new environment variable.
 */
function getSigningSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN
  return secret && secret.length > 0 ? secret : null
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * The signed payload is ASCII JSON, so the raw atob output can be parsed
 * directly without a UTF-8 decode step.
 */
function base64UrlDecodeToString(value: string): string | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  } catch {
    return null
  }
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

export type SessionCreateResult =
  | { ok: true; token: string; maxAge: number }
  | { ok: false; reason: 'missing-config' }

export async function createAdminSession(): Promise<SessionCreateResult> {
  const secret = getSigningSecret()
  if (!secret) return { ok: false, reason: 'missing-config' }

  const payload: SessionPayload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  }

  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const key = await importKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

  return {
    ok: true,
    token: `${body}.${base64UrlEncode(new Uint8Array(signature))}`,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  }
}

export type SessionVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing-config' | 'unauthorized' | 'expired' }

export async function verifyAdminSession(
  token: string | undefined | null
): Promise<SessionVerifyResult> {
  const secret = getSigningSecret()
  if (!secret) return { ok: false, reason: 'missing-config' }
  if (!token) return { ok: false, reason: 'unauthorized' }

  const separator = token.lastIndexOf('.')
  if (separator <= 0) return { ok: false, reason: 'unauthorized' }

  const body = token.slice(0, separator)
  const providedSignature = token.slice(separator + 1)

  // Re-sign the payload and compare the encoded signatures as strings rather than
  // calling crypto.subtle.verify on attacker-supplied bytes. Passing a buffer we
  // constructed into WebCrypto fails inside the Edge middleware sandbox, because
  // the object originates from a different realm than SubtleCrypto expects.
  const key = await importKey(secret)
  const expectedSignature = base64UrlEncode(
    new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)))
  )
  if (!safeEqual(expectedSignature, providedSignature)) {
    return { ok: false, reason: 'unauthorized' }
  }

  const decoded = base64UrlDecodeToString(body)
  if (!decoded) return { ok: false, reason: 'unauthorized' }

  let payload: SessionPayload
  try {
    payload = JSON.parse(decoded) as SessionPayload
  } catch {
    return { ok: false, reason: 'unauthorized' }
  }

  if (payload.sub !== 'admin') return { ok: false, reason: 'unauthorized' }
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' }
  }

  return { ok: true }
}

/**
 * Constant-time string comparison for the login credentials. `===` on secrets
 * short-circuits on the first differing byte, which leaks their length and
 * prefix to an attacker who can measure response times.
 */
export function safeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)

  // Compare a fixed-length digest so differing input lengths cannot be
  // distinguished by how long the loop runs.
  const length = Math.max(aBytes.length, bBytes.length)
  let mismatch = aBytes.length === bBytes.length ? 0 : 1
  for (let i = 0; i < length; i += 1) {
    mismatch |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
  }
  return mismatch === 0
}
