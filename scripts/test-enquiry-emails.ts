/**
 * Sends team + user confirmation test emails.
 * Run: npm run email:test
 */
import {
  sendEmail,
  getEnquiryFrom,
  getEnquiryInbox,
  getNoreplyFrom,
  getPublicContactEmail,
} from '../lib/email/resend'
import { teamEnquiryEmail, userConfirmationEmail } from '../lib/email/templates'

function getTestRecipient(): string {
  const to = process.env.TEST_EMAIL_TO ?? "dhruvchaturvediiitb@gmail.com"
  if (!to) {
    console.error('Set TEST_EMAIL_TO in .env.local')
    process.exit(1)
  }
  return to
}


function getTestEnquiryRecipient(): string {
  const to = process.env.ENQUIRY_INBOX ?? "dhruvastro67@gmail.com"
  if (!to) {
    console.error('Set ENQUIRY_INBOX in .env.local')
    process.exit(1)
  }
  return to
}
const TEST_TO = getTestRecipient()
const ENQUIRY_INBOX = getTestEnquiryRecipient()
const sample = {
  name: 'Dhruv Chaturvedi',
  email: TEST_TO,
  phone: '+91 88003 85198',
  company: 'Groove Infra',
  projectType: 'Commercial',
  location: 'New Delhi',
  message: 'Test enquiry — confirming the contact form email flow works. Safe to ignore.',
}

async function main() {
  console.log('Noreply from:', getNoreplyFrom())
  console.log('Enquiry from:', getEnquiryFrom())
  console.log('Enquiry inbox:', getEnquiryInbox())
  console.log('Sending confirmation to:', TEST_TO)

  const confirmation = await sendEmail({
    from: getNoreplyFrom(),
    to: TEST_TO,
    subject: 'We received your enquiry — Groove Infra (test)',
    html: userConfirmationEmail(sample),
    replyTo: getPublicContactEmail(),
  })

  if (!confirmation.ok) {
    console.error('Confirmation FAILED:', confirmation.message)
    process.exit(1)
  }
  console.log('Confirmation sent, id:', confirmation.id)

  const team = await sendEmail({
    from: getEnquiryFrom(),
    to: ENQUIRY_INBOX as string,
    subject: `New Enquiry: ${sample.projectType} — ${sample.name} (test)`,
    html: teamEnquiryEmail(sample),
    replyTo: sample.email as string,
  })

  console.log('Done — check your inbox.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
