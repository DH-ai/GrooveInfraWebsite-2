/**
 * Best-effort in-process fixed-window rate limiter.
 *
 * Deliberately dependency-free so no external service is required. The trade-off
 * is that the counter lives in one server instance's memory, so on a serverless
 * platform the effective limit is per-instance and resets on cold start. It
 * raises the cost of casual abuse and accidental double submits; Turnstile is the
 * primary defence against determined spam.
 *
 * To make limits global, swap `hit()` for a Redis/Upstash INCR with the same
 * signature — no caller changes needed.
 */

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

/** Stops the map growing without bound on a long-lived server. */
const MAX_TRACKED_KEYS = 10_000

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function hit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweep(now)
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds }
}

/**
 * Best-effort client identity. On Vercel the platform sets x-forwarded-for and
 * strips client-supplied values at the edge; elsewhere these headers are
 * spoofable, which is another reason this is a speed bump rather than a
 * guarantee.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  return `${scope}:${ip}`
}
