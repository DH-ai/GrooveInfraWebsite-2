import SectionHead from '@/components/ui/SectionHead'
import AnimatedSection from '@/components/ui/AnimatedSection'

const stats = [
  { figure: '150+', label: 'Projects delivered', note: 'Retail, workplace, hospitality, residential' },
  { figure: '25+', label: 'Brands served', note: 'Repeat programmes across NCR and beyond' },
  { figure: '2016', label: 'Building since', note: 'Same core site team' },
  { figure: '96%', label: 'Handed over on date', note: 'Against the programme agreed at award' },
]

/**
 * The numbers, set as figures.
 *
 * These used to animate upward from zero on scroll, which meant the section was a
 * client component, showed a wrong number for the first two seconds, and drew the
 * eye to the counting rather than the claim. A figure that a client might repeat
 * to their board should simply be there when they look at it.
 */
export default function Stats() {
  return (
    <section className="section-y gutter border-y border-subtle bg-surface">
      <div className="mx-auto w-full max-w-[100rem]">
        <SectionHead index="03" label="Track record" title="What the record says." />

        {/*
          The figure reads first but the label is the term, so the `dt` comes
          first in the source and the flex order puts the number on top. Two `dd`s
          to one `dt` is valid, and it keeps the note out of a stray paragraph
          that a definition list is not allowed to contain.
        */}
        <dl className="mt-14 grid grid-cols-1 gap-px bg-subtle sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <AnimatedSection
              key={stat.label}
              delay={Math.min(i * 0.07, 0.28)}
              className="flex flex-col bg-surface px-6 py-10 sm:px-8"
            >
              <dt className="order-2 mt-5 text-body font-medium text-primary">{stat.label}</dt>
              <dd className="nums-tabular order-1 font-display text-h2 font-semibold leading-none text-primary">
                {stat.figure}
              </dd>
              <dd className="order-3 mt-2 text-meta text-muted-custom">{stat.note}</dd>
            </AnimatedSection>
          ))}
        </dl>
      </div>
    </section>
  )
}
