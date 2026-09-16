import { NextResponse } from 'next/server'
import { sendEnquiryEmails } from '@/lib/email/send-enquiry'
import { markEnquiryEmailed, saveEnquiry } from '@/lib/enquiries'
import { clientKey, hit } from '@/lib/rate-limit'
import { detectSpam } from '@/lib/spam'
import { verifyTurnstile } from '@/lib/turnstile'
import { contactSchema, firstIssueMessage } from '@/lib/validation'

/** Five submissions per IP per ten minutes: generous for humans, costly for bots. */
const RATE_LIMIT = 5
const RATE_WINDOW_SECONDS = 10 * 60

/**
 * Never echo a provider or database error to an anonymous caller. The previous
 * implementation returned Resend's raw message verbatim, disclosing the vendor and
 * its API semantics.
 */
const GENERIC_FAILURE = 'We could not send your message. Please email or call us directly.'

export async function POST(req: Request) {
  const limit = hit(clientKey(req, 'contact'), RATE_LIMIT, RATE_WINDOW_SECONDS)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 })
  }

  const { botField, renderedAt, turnstileToken, ...enquiry } = parsed.data

  // Report success to bots rather than a 4xx, so they get no signal to adapt.
  // Nothing is stored and no email is sent.
  const spam = detectSpam({ botField, renderedAt })
  if (spam.spam) {
    console.warn('[contact] dropped suspected spam:', spam.signal)
    return NextResponse.json({ ok: true })
  }

  const turnstile = await verifyTurnstile(turnstileToken, req.headers.get('x-forwarded-for'))
  if (!turnstile.ok) {
    const status = turnstile.reason === 'verify-unavailable' ? 503 : 400
    return NextResponse.json(
      { error: 'We could not verify that you are human. Please try again.' },
      { status }
    )
  }

  // Persist before sending, so a mail failure cannot lose the lead.
  const saved = await saveEnquiry(enquiry)
  if (!saved.ok) {
    console.error('[contact] failed to store enquiry:', saved.message)
  }

  const result = await sendEnquiryEmails(enquiry)
  if (!result.ok) {
    console.error('[contact] send error:', result.message)

    // The enquiry is safely recorded, so tell the visitor it went through rather
    // than pushing them to submit again and create a duplicate.
    if (saved.ok) return NextResponse.json({ ok: true })

    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 502 })
  }

  if (saved.ok) await markEnquiryEmailed(saved.id)

  return NextResponse.json({ ok: true })
}
