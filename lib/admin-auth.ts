import { cookies } from 'next/headers'

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; reason: 'missing-config' | 'unauthorized' }

export function checkAdminAuth(): AdminAuthResult {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) return { ok: false, reason: 'missing-config' }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) return { ok: false, reason: 'unauthorized' }

  return { ok: true }
}
