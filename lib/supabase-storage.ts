import { PROJECTS_BUCKET } from '@/lib/supabase'

/**
 * Image URLs written to the database must point at our own storage bucket.
 * Accepting arbitrary URLs would let an authenticated admin (or anything that
 * reached the endpoint) embed third-party or malicious sources on public pages.
 *
 * Previously duplicated verbatim in both admin project routes.
 */
export function getPublicUrlPrefix(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${PROJECTS_BUCKET}/`
}

export function isAllowedImageUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith(getPublicUrlPrefix())
}
