import SectionHead from '@/components/ui/SectionHead'
import AnimatedSection from '@/components/ui/AnimatedSection'

const services = [
  {
    title: 'Retail rollouts',
    description:
      'Single flagships through to nationwide programmes. Shopfronts, POS counters, display systems, lighting and the services behind them, sequenced so each store opens on its own date.',
    detail: 'Flagships · Mall units · Multi-city rollouts',
  },
  {
    title: 'Hospitality and clubs',
    description:
      'Hotels, restaurants, lounges and spas, where the finish is the product. Acoustic separation, kitchen and bar services, and joinery held to a tolerance guests will run their hand along.',
    detail: 'F&B · Hotels · Lounges · Spas',
  },
  {
    title: 'Workplace and commercial',
    description:
      'Headquarters, co-working floors, clinics and showrooms. Built around the client staying operational, which usually means night shifts, phased handovers and a live building next door.',
    detail: 'HQ fit-outs · Co-working · Clinics · Showrooms',
  },
  {
    title: 'Residential',
    description:
      'Apartments, penthouses and villas. Bespoke joinery, stone and metalwork detailed in-house, with one site team accountable from setting out to snag-free handover.',
    detail: 'Apartments · Penthouses · Villas',
  },
]

/**
 * What the firm does, as a list rather than a card wall.
 *
 * The previous version put each service in a bordered tile with an icon in a
 * rounded chip — a pattern that reads as a software pricing page and that forces
 * every description down to the length of the shortest one. Setting them as
 * ruled rows lets the copy say something specific about how the work is actually
 * run, which is what a client is buying.
 */
export default function Services() {
  return (
    <section className="section-y gutter bg-base">
      <div className="mx-auto w-full max-w-[100rem]">
        <SectionHead
          index="02"
          label="Capability"
          title="Four sectors, one site team."
          intro="The trades are ours, the programme is ours, and the person who priced the job is the person who hands it over."
        />

        {/*
          A `dl` may only contain `dt`, `dd` and a single layer of `div` grouping
          them, so the scroll-reveal wrapper *is* the group rather than sitting
          outside it, and the sheet number lives inside the `dt` instead of
          floating between the two as a stray span.
        */}
        <dl className="mt-14 border-b border-subtle">
          {services.map((service, i) => (
            <AnimatedSection
              key={service.title}
              delay={Math.min(i * 0.06, 0.24)}
              className="grid grid-cols-1 gap-x-12 gap-y-4 border-t border-subtle py-9 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]"
            >
              <dt>
                <span
                  aria-hidden="true"
                  className="nums-tabular mb-4 block text-micro text-muted-custom"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="block font-display text-h3 font-semibold text-primary">
                  {service.title}
                </span>
                <span className="mt-3 block text-micro uppercase tracking-eyebrow text-muted-custom">
                  {service.detail}
                </span>
              </dt>

              <dd className="measure text-body text-secondary lg:pt-9">{service.description}</dd>
            </AnimatedSection>
          ))}
        </dl>
      </div>
    </section>
  )
}
