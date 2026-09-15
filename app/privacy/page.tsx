import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} collects, uses, and protects the personal information you share through this website.`,
  alternates: { canonical: '/privacy' },
}

/**
 * Structural draft. Every claim below reflects what the code actually does today
 * — the enquiry form writes to Supabase and sends mail through Resend, analytics
 * are Vercel's cookieless product, and the CAPTCHA is Cloudflare Turnstile — so
 * the review is about legal sufficiency rather than accuracy.
 */
const LAST_UPDATED = '2026-09-15'

const sections: LegalSection[] = [
  {
    heading: 'Who we are',
    body: [
      `${SITE_NAME} is an interior construction and fit-out contractor based in New Delhi, India. This policy covers this website and the enquiries you send through it. It does not cover the separate contractual arrangements we enter into with clients, which are governed by the relevant project agreement.`,
    ],
  },
  {
    heading: 'What we collect',
    body: [
      'We only collect what you choose to send us. There is no account system on this site and we do not build advertising profiles.',
    ],
    bullets: [
      'Enquiry details you submit through the contact form: your name, email address, and message, plus the optional phone number, company, project type, and city fields.',
      'Aggregate, non-identifying usage statistics such as page views, referrers, approximate country, and page performance timings.',
      'Technical information needed to keep the form usable, including your IP address, which is used transiently to apply rate limits and to run the anti-spam check.',
    ],
  },
  {
    heading: 'Why we use it',
    body: ['Each purpose below is limited to what the site actually needs.'],
    bullets: [
      'To read, reply to, and follow up on your enquiry, and to keep a record of it so it is not lost if an email fails to send.',
      'To understand which pages and projects are of interest, so we can improve the site.',
      'To detect and block automated spam submissions and abuse of the enquiry form.',
    ],
  },
  {
    heading: 'Cookies and similar technologies',
    body: [
      'We do not use advertising or cross-site tracking cookies. The site stores your light or dark theme preference in your browser so it persists between visits, and sets a session cookie only for administrators signing in to manage project content.',
      'Our analytics are configured to be cookieless and report aggregate figures only.',
      'The anti-spam challenge on the enquiry form is provided by Cloudflare Turnstile, which may set its own technical storage in order to distinguish people from bots.',
    ],
  },
  {
    heading: 'Who we share it with',
    body: [
      'We do not sell your personal information, and we do not share it for advertising. We use a small number of service providers who process data on our behalf, under their own terms:',
    ],
    bullets: [
      'Supabase — hosts the database that stores enquiry records.',
      'Resend — delivers the enquiry notification to us and the confirmation to you.',
      'Vercel — hosts the website and provides the aggregate analytics and performance metrics.',
      'Cloudflare — provides the Turnstile anti-spam challenge on the enquiry form.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'We keep enquiry records for as long as needed to respond and to maintain a reasonable business record of the conversation, and then delete or anonymise them. Aggregate analytics contain no personal information and are retained by our analytics provider under their own retention schedule.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'Subject to applicable law, you can ask us to give you a copy of the information we hold about you, correct it if it is wrong, or delete it. You can also ask us to stop contacting you at any time. We will respond to any such request within a reasonable period.',
    ],
  },
  {
    heading: 'Security',
    body: [
      'Enquiry records are stored in a database that is not publicly readable and is reachable only by our server. Administrative access to project content requires a signed-in session. No system is perfectly secure, but we take reasonable technical measures appropriate to the sensitivity of the information involved.',
    ],
  },
  {
    heading: 'Children',
    body: [
      'This website is aimed at businesses and property owners and is not directed at children. We do not knowingly collect information from children.',
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      'If we change how we handle personal information, we will update this page and revise the date shown above. Material changes will be described here rather than applied silently.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      draft
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={`This policy explains what personal information ${SITE_NAME} collects through this website, why we collect it, who we share it with, and what you can ask us to do with it.`}
      sections={sections}
    />
  )
}
