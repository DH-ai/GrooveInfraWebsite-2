import type { Metadata } from 'next'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import SectionHead from '@/components/ui/SectionHead'

export const metadata: Metadata = {
  title: 'Innovation',
  description:
    'Groove Infra Innovation Lab — cost estimation, modular systems, vendor procurement and project analytics for interior construction.',
  alternates: { canonical: '/innovation' },
  // This page describes unreleased work and is disallowed in robots.txt. robots.txt
  // only asks crawlers not to fetch it; a page already in an index needs this tag
  // to be dropped, so the two work together rather than either alone.
  robots: { index: false, follow: false },
}

const initiatives = [
  {
    title: 'Cost estimator',
    status: 'In development',
    description:
      'Interior cost predictions from a floor plan, trained on completed Indian fit-outs, so a client has a defensible number before a designer is engaged.',
  },
  {
    title: 'Modular interior systems',
    status: 'Prototyping',
    description:
      'Pre-fabricated, interchangeable components that move work off the site and into the workshop, cutting installation time without giving up the finish.',
  },
  {
    title: 'Vendor marketplace',
    status: 'Planned',
    description:
      'Verified contractors bidding for scoped packages, so procurement is competitive and the price of every trade is visible rather than buried in a lump sum.',
  },
  {
    title: 'Project intelligence',
    status: 'Planned',
    description:
      'Milestone tracking and delay alerts drawn from site data, so a slipping programme is visible in the week it slips rather than at handover.',
  },
]

export default function InnovationPage() {
  return (
    <PageShell>
      <PageHeader
        label="Innovation lab"
        title="What we are building next."
        intro="Four pieces of work aimed at the parts of a fit-out that are still guesswork: what it will cost, how long it will take, and who is doing it. None of them has shipped, and this page says which stage each is at."
      />

      {/*
        A ruled list with the stage in the margin, in place of four cards that
        each carried a tinted icon chip, a "Coming Soon" pill and a coloured
        gradient that appeared on hover. Four different accent colours on one page
        and no way to tell which of the four was actually closest to shipping.
      */}
      <section className="mt-24">
        <SectionHead index="01" label="Initiatives" aside={`${initiatives.length} in progress`} />

        <dl className="mt-14 border-b border-subtle">
          {initiatives.map((item, i) => (
            <AnimatedSection
              key={item.title}
              delay={Math.min(i * 0.05, 0.2)}
              className="grid grid-cols-1 gap-x-12 gap-y-3 border-t border-subtle py-9 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]"
            >
              <dt>
                <span aria-hidden="true" className="nums-tabular block text-micro text-muted-custom">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-4 block font-display text-h3 font-semibold text-primary">
                  {item.title}
                </span>
                <span className="mt-3 block text-micro uppercase tracking-eyebrow text-accent-gold">
                  {item.status}
                </span>
              </dt>
              <dd className="measure text-body text-secondary lg:pt-9">{item.description}</dd>
            </AnimatedSection>
          ))}
        </dl>
      </section>

      <section className="mt-28">
        <SectionHead index="02" label="Why" title="The estimate is the weak point." />

        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
          <AnimatedSection>
            <div className="measure space-y-6 text-body-lg text-secondary">
              <p>
                A fit-out is priced before anyone has surveyed the site properly, and the number is
                defended for the rest of the job. That is where programmes slip and where trust goes.
              </p>
              <p>
                Everything on this page attacks the same problem from a different side: better data
                at the estimate, less work exposed to the site, visible pricing per trade, and early
                warning when the programme moves.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="border-t border-strong pt-10">
              <h3 className="max-w-[24ch] font-display text-h3 font-semibold text-primary">
                Want early access?
              </h3>
              <p className="measure mt-6 text-body text-secondary">
                We are running these against live projects first. If you have a programme coming up
                and want to be one of them, tell us the dates.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex min-h-11 items-center bg-groove-gold px-8 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
              >
                Start an enquiry
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageShell>
  )
}
