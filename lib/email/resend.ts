import { Resend } from 'resend'

export function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

const TEST_SENDER = 'Groove Infra <onboarding@resend.dev>'

function devOr(from: string): string {
  if (process.env.RESEND_USE_TEST_SENDER === 'true') return TEST_SENDER
  if (process.env.NODE_ENV !== 'production' && !process.env.NOREPLY_FROM && !process.env.ENQUIRY_FROM) {
    return TEST_SENDER
  }
  return from
}

/** Auto-reply to visitors after they submit the enquiry form. */
export function getNoreplyFrom(): string {
  return devOr(process.env.NOREPLY_FROM ?? 'Groove Infra <noreply@grooveinfra.in>')
}

/** Internal alert when someone submits the enquiry form. */
export function getEnquiryFrom(): string {
  return devOr(process.env.ENQUIRY_FROM ?? 'Groove Infra Enquiries <enquire@grooveinfra.in>')
}

/** Your private inbox — set ENQUIRY_INBOX in .env.local only (never commit). */
export function getEnquiryInbox(): string {
  const inbox =
    process.env.ENQUIRY_INBOX ?? process.env.CONTACT_EMAIL // legacy; prefer ENQUIRY_INBOX

  if (!inbox) {
    throw new Error('ENQUIRY_INBOX is not set. Add your personal email to .env.local')
  }

  return inbox
}

/** Public address on the website for manual contact (not your private inbox). */
export function getPublicContactEmail(): string {
  return process.env.PUBLIC_CONTACT_EMAIL ?? 'contactus@grooveinfra.in'
}

export async function sendEmail(params: {
  from: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const resend = getResendClient()
  const { data, error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true, id: data?.id ?? '' }
}
