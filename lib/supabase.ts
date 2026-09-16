import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { PROJECTS_CACHE_TAG } from '@/lib/cache-tags'

export const PROJECTS_BUCKET = 'project-images'

function getEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  if (!serviceRoleKey) throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

/**
 * Client for public page reads. Uses the anon key so that reads are subject to
 * Row Level Security, which is what the `projects_public_read` policy in
 * supabase/schema.sql exists to enforce. Never fall back to the service-role key
 * here — that silently bypasses RLS on every visitor-facing request.
 *
 * Queries are tagged so admin mutations can invalidate Next's Data Cache; see
 * PROJECTS_CACHE_TAG.
 */
export function getSupabaseRead(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const taggedFetch: typeof fetch = (input, init) =>
    fetch(input, { ...init, next: { tags: [PROJECTS_CACHE_TAG] } } as RequestInit)

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: taggedFetch },
  })
}
