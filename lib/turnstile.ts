/**
 * Cloudflare Turnstile verification.
 *
 * Enabled by configuration: when TURNSTILE_SECRET_KEY is absent, verification is
 * skipped so local development and the current deployment keep working, and
 * protection switches on the moment the keys are added. The honeypot, timing
 * check and rate limiter apply either way.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export type TurnstileResult =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: 'missing-token' | 'invalid-token' | 'verify-unavailable' }

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string | null
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: true, skipped: true }

  if (!token) return { ok: false, reason: 'missing-token' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[turnstile] siteverify HTTP', response.status)
      return { ok: false, reason: 'verify-unavailable' }
    }

    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (data.success) return { ok: true, skipped: false }

    console.warn('[turnstile] rejected:', data['error-codes']?.join(',') ?? 'unknown')
    return { ok: false, reason: 'invalid-token' }
  } catch (err) {
    console.error('[turnstile] siteverify failed:', err)
    return { ok: false, reason: 'verify-unavailable' }
  }
}
