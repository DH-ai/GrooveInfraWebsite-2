import { getSupabaseAdmin } from '@/lib/supabase'
import type { ContactInput } from '@/lib/validation'

/**
 * Contact form submissions were previously emailed and never stored, so a mail
 * provider failure meant the lead was lost with no record. Every enquiry is now
 * persisted first and the email send is treated as a secondary step.
 *
 * The table has no anon-accessible RLS policy: enquiries hold personal data and
 * are only reachable through the service-role key on the server.
 */

export type EnquiryStatus = 'new' | 'contacted' | 'closed'

export interface EnquiryRecord {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  project_type: string | null
  location: string | null
  message: string
  status: EnquiryStatus
  email_sent: boolean
  created_at: string
}

type SaveResult = { ok: true; id: number } | { ok: false; message: string }

export async function saveEnquiry(
  input: Pick<
    ContactInput,
    'name' | 'email' | 'phone' | 'company' | 'projectType' | 'location' | 'message'
  >
): Promise<SaveResult> {
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return { ok: false, message: (err as Error).message }
  }

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        company: input.company ?? null,
        project_type: input.projectType ?? null,
        location: input.location ?? null,
        message: input.message,
      })
      .select('id')
      .single()

    if (error || !data) {
      return { ok: false, message: error?.message ?? 'insert returned no row' }
    }

    return { ok: true, id: data.id as number }
  } catch (err) {
    return { ok: false, message: (err as Error).message }
  }
}

/** Records that the notification emails went out, so failures are visible in the admin list. */
export async function markEnquiryEmailed(id: number): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('enquiries').update({ email_sent: true }).eq('id', id)
    if (error) console.error('[enquiries] markEnquiryEmailed failed:', error.message)
  } catch (err) {
    console.error('[enquiries] markEnquiryEmailed failed:', (err as Error).message)
  }
}

export async function getAllEnquiries(limit = 200): Promise<EnquiryRecord[]> {
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    console.error('[enquiries] Supabase not configured:', (err as Error).message)
    return []
  }

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[enquiries] getAllEnquiries error:', error.message)
    return []
  }

  return (data ?? []) as EnquiryRecord[]
}
