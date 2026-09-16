import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { CONTACT_EMAIL } from '@/lib/site'

/**
 * The closing ask.
 *
 * Previously a rounded panel with two radial gold glows, a faint grid overlay, a
 * pulsing dot, gradient-filled text and a button that grew on hover — six
 * effects competing for the one moment on the page where the visitor is deciding
 * whether to get in touch. Everything here is type, a rule and a link.
 */
export default function CallToAction() {
  return (
    <section className="section-y gutter border-t border-subtle bg-base">
      <div className="mx-auto w-full max-w-[100rem]">
        <AnimatedSection>
          <p className="text-micro uppercase tracking-eyebrow text-accent-gold">Next step</p>

          <h2 className="mt-8 max-w-[16ch] font-display text-h1 font-semibold text-primary">
            Tell us the date it has to open.
          </h2>

          <p className="measure mt-8 text-body-lg text-secondary">
            Send the drawings, the site address, or just the deadline. We will come back with a
            programme and a price, and say plainly if the date is not achievable.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Link
              href="/contact"
              className="group inline-flex min-h-11 items-center gap-3 bg-groove-gold px-8 py-4 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
            >
              Start an enquiry
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex min-h-11 items-center underline decoration-1 underline-offset-[7px] decoration-strong text-meta text-secondary transition-colors hover:decoration-groove-gold hover:text-primary"
              >
                {CONTACT_EMAIL}
              </a>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
