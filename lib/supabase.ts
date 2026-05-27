import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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

export function getSupabaseRead(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}
