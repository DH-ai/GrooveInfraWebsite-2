import {
  sendEmail,
  getEnquiryFrom,
  getEnquiryInbox,
  getNoreplyFrom,
  getPublicContactEmail,
} from './resend'
import {
  teamEnquiryEmail,
  userConfirmationEmail,
  type EnquiryDetails,
} from './templates'

/**
 * Enquiry form email flow:
 * 1. Visitor submits form → confirmation from noreply@grooveinfra.in → visitor
 * 2. You receive alert from enquire@grooveinfra.in → ENQUIRY_INBOX (personal Gmail)
 * Public contactus@grooveinfra.in is for manual email only (shown on site).
 */
export async function sendEnquiryEmails(
  data: EnquiryDetails
): Promise<{ ok: true } | { ok: false; message: string }> {
  const teamResult = await sendEmail({
    from: getEnquiryFrom(),
    to: getEnquiryInbox(),
    subject: `New Enquiry: ${data.projectType || 'General'} — ${data.name}`,
    html: teamEnquiryEmail(data),
    replyTo: data.email,
  })

  if (!teamResult.ok) {
    return teamResult
  }

  const userResult = await sendEmail({
    from: getNoreplyFrom(),
    to: data.email,
    subject: 'We received your enquiry — Groove Infra',
    html: userConfirmationEmail(data),
    replyTo: getPublicContactEmail(),
  })

  if (!userResult.ok) {
    return userResult
  }

  return { ok: true }
}
