import type { Metadata } from 'next'
import AnimatedSection from '@/components/ui/AnimatedSection'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import SectionHead from '@/components/ui/SectionHead'
import ContactForm from '@/components/contact/ContactForm'
import FaqAccordion from '@/components/contact/FaqAccordion'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell Groove Infra the date your space has to open. Send the drawings, the site address, or just the deadline, and we will come back with a programme and a price.',
  alternates: { canonical: '/contact' },
}

const OFFICE_LINES = [
  'Plot No-416/2, Metro Pillar No-127',
  'Mehrauli-Gurgaon Rd, Ghitorni',
  'New Delhi 110030',
]

const MAPS_HREF =
  'https://www.google.com/maps/search/?api=1&query=Plot+No-416%2F2%2C+Metro+Pillar+No-127%2C+Mehrauli-Gurgaon+Rd%2C+Ghitorni%2C+New+Delhi%2C+Delhi+110030'

/**
 * The published email comes from PUBLIC_CONTACT_EMAIL, and the row is dropped
 * rather than rendered with a placeholder when that is not configured.
 */
const directLines = [
  ...(CONTACT_EMAIL ? [{ label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }] : []),
  { label: 'Phone', value: '+91 88003 85198', href: 'tel:+918800385198' },
]

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        label="Enquiries"
        title="Tell us the date it has to open."
        intro="Send the drawings, the site address, or just the deadline. We will come back with a programme and a price, and say plainly if the date is not achievable."
      />

      {/*
        The form leads and the details sit beside it on a hairline column. The
        previous version put email, phone and address into three rounded cards
        with a tinted icon chip each, then two more cards below for response time
        and coverage — five pieces of chrome around eleven words of information.
      */}
      <div className="mt-24 grid grid-cols-1 gap-x-16 gap-y-20 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <AnimatedSection>
          <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-accent-gold">
            The brief
          </h2>
          <div className="mt-10">
            <ContactForm />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-accent-gold">
            Direct
          </h2>

          <dl className="mt-2">
            {directLines.map(({ label, value, href }) => (
              <div key={label} className="border-b border-subtle py-4">
                <dt className="text-meta text-muted-custom">{label}</dt>
                <dd className="mt-1">
                  <a
                    href={href}
                    className="inline-flex min-h-11 items-center text-meta font-medium text-primary transition-colors hover:text-accent-gold"
                  >
                    {value}
                  </a>
                </dd>
              </div>
            ))}

            <div className="border-b border-subtle py-4">
              <dt className="text-meta text-muted-custom">Office</dt>
              <dd className="mt-1 text-meta text-primary">
                <address className="not-italic leading-relaxed">
                  {OFFICE_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={MAPS_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center underline decoration-1 underline-offset-[7px] decoration-strong text-micro uppercase tracking-eyebrow text-muted-custom transition-colors hover:decoration-groove-gold hover:text-accent-gold"
                >
                  Open in maps
                </a>
              </dd>
            </div>

            <div className="border-b border-subtle py-4">
              <dt className="text-meta text-muted-custom">Reply</dt>
              <dd className="mt-1 text-meta text-primary">
                Within 24 business hours. Call for a same-day site visit.
              </dd>
            </div>

            <div className="border-b border-subtle py-4">
              <dt className="text-meta text-muted-custom">On site in</dt>
              <dd className="mt-1 text-meta text-primary">Delhi, Gurgaon, Noida and the wider NCR</dd>
            </div>
          </dl>
        </AnimatedSection>
      </div>

      <div className="mt-28">
        <SectionHead
          index="01"
          label="Questions"
          title="Asked before the first site visit."
        />
        <div className="measure mt-14">
          <FaqAccordion />
        </div>
      </div>
    </PageShell>
  )
}
