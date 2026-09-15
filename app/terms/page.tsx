import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `The terms that apply to your use of the ${SITE_NAME} website, including enquiries, intellectual property, and limits of liability.`,
  alternates: { canonical: '/terms' },
}

/**
 * Structural draft, pending legal review. These terms deliberately cover the
 * website only; project delivery is governed by the signed contract for each job
 * and must not be implied here.
 */
const LAST_UPDATED = '2026-09-15'

const sections: LegalSection[] = [
  {
    heading: 'These terms',
    body: [
      `By using this website you agree to these terms. If you do not agree with them, please do not use the site. "We", "us", and "our" refer to ${SITE_NAME}.`,
    ],
  },
  {
    heading: 'What this website is',
    body: [
      'This site presents our work, capabilities, and contact details. Nothing on it is an offer capable of acceptance, a quotation, or a binding commitment to carry out work. Project scope, price, programme, and warranties are set out only in a signed contract for the specific project.',
    ],
  },
  {
    heading: 'Enquiries you send us',
    body: [
      'When you submit the enquiry form you agree to provide information that is accurate and that you are entitled to share. Please do not send confidential drawings, commercially sensitive material, or anyone else’s personal information through the form.',
      'Submitting an enquiry does not create a contract or a professional relationship between us. We will reply where we can, but we are not obliged to respond to or act on every enquiry.',
    ],
  },
  {
    heading: 'Acceptable use',
    body: ['You agree not to:'],
    bullets: [
      'Use the site or the enquiry form to send spam, malware, or unlawful, misleading, or abusive content.',
      'Attempt to gain unauthorised access to any part of the site, its administrative area, or its underlying infrastructure.',
      'Scrape, copy, or systematically extract content from the site for commercial purposes without our written permission.',
      'Interfere with the availability of the site, including by attempting to overload it.',
    ],
  },
  {
    heading: 'Intellectual property',
    body: [
      `The design, text, layout, and photography on this site are owned by ${SITE_NAME} or used with permission, and are protected by copyright and other intellectual property rights. You may view and print pages for your own reference or to evaluate working with us. Any other use — including reproduction, redistribution, or use in your own marketing — requires our prior written consent.`,
      'Client names, logos, and brands shown in the portfolio remain the property of their respective owners and appear only to identify completed work.',
    ],
  },
  {
    heading: 'Project imagery',
    body: [
      'Portfolio images illustrate completed projects and are not a guarantee of any particular finish, material, specification, or outcome on your project. Some images may be representative or may show a project at a particular stage. Where a placeholder image is shown, it is not a photograph of our work.',
    ],
  },
  {
    heading: 'Accuracy and availability',
    body: [
      'We take care to keep the site accurate and up to date, but we do not warrant that it is complete, current, or free of errors. Details such as project figures, timelines, and service areas may change. We may modify, suspend, or withdraw any part of the site at any time, and we do not guarantee uninterrupted availability.',
    ],
  },
  {
    heading: 'External links',
    body: [
      'Where we link to another website, we do so for convenience only. We do not control those sites, do not endorse their content, and are not responsible for them. Their own terms and privacy policies will apply.',
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'To the fullest extent permitted by law, we are not liable for any indirect or consequential loss, or for any loss of profit, revenue, business, or data, arising from your use of this website or from reliance on its content. Nothing in these terms limits any liability that cannot lawfully be limited.',
    ],
  },
  {
    heading: 'Privacy',
    body: [
      'Our handling of personal information is described in our Privacy Policy, which forms part of these terms.',
    ],
  },
  {
    heading: 'Governing law',
    body: [
      'These terms are governed by the laws of India, and the courts at New Delhi have exclusive jurisdiction over any dispute arising from them or from your use of this website.',
    ],
  },
  {
    heading: 'Changes to these terms',
    body: [
      'We may update these terms from time to time. The version published on this page, with the date shown above, is the one that applies.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      draft
      eyebrow="Legal"
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      intro={`These terms apply to your use of the ${SITE_NAME} website. They cover the site itself — the delivery of any project is governed separately by the contract signed for that project.`}
      sections={sections}
    />
  )
}
