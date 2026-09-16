import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/admin-session'

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; reason: 'missing-config' | 'unauthorized' | 'expired' }

/**
 * Verifies the signed admin session cookie. `middleware.ts` already blocks
 * unauthenticated requests to /admin and /api/admin; this is defence in depth for
 * the route handlers so they never depend solely on the matcher being correct.
 */
export async function checkAdminAuth(): Promise<AdminAuthResult> {
  return verifyAdminSession(cookies().get(ADMIN_COOKIE_NAME)?.value)
}

/** Server-component guard: redirects to the login screen instead of returning a result. */
export async function requireAdmin(): Promise<void> {
  const auth = await checkAdminAuth()
  if (auth.ok) return

  const params = new URLSearchParams()
  if (auth.reason !== 'unauthorized') params.set('error', auth.reason)
  const query = params.toString()
  redirect(query ? `/admin/login?${query}` : '/admin/login')
}
