import AnimatedSection from '@/components/ui/AnimatedSection'

interface SectionHeadProps {
  /** Sheet number, e.g. `01`. Decorative: it orders the page, it is not content. */
  index: string
  label: string
  title?: React.ReactNode
  /** Sits under the title, capped to a readable measure. */
  intro?: React.ReactNode
  /** Rendered on the opposite side of the rule on wide screens. */
  aside?: React.ReactNode
  as?: 'h2' | 'h3'
  className?: string
}

/**
 * The opener every section shares: a hairline rule carrying a sheet number and a
 * label, with the heading hanging below it.
 *
 * Replaces the centred eyebrow-over-heading block that opened all six homepage
 * sections identically. Centred headings give a page no edge to read down and no
 * way to tell one section from the next; a numbered rule borrows from the
 * drawing set the firm already issues, and gives every section the same left
 * margin as the copy beneath it.
 */
export default function SectionHead({
  index,
  label,
  title,
  intro,
  aside,
  as: Heading = 'h2',
  className = '',
}: SectionHeadProps) {
  return (
    <AnimatedSection className={className}>
      <div className="flex items-baseline justify-between gap-6 border-t border-strong pt-4">
        <p className="flex items-baseline gap-3 text-micro uppercase tracking-eyebrow text-accent-gold">
          <span aria-hidden="true" className="nums-tabular text-muted-custom">
            {index}
          </span>
          {label}
        </p>
        {aside && <div className="hidden text-meta text-muted-custom sm:block">{aside}</div>}
      </div>

      {title && (
        <Heading className="mt-6 max-w-[22ch] font-display text-h2 font-semibold text-primary">
          {title}
        </Heading>
      )}

      {intro && <div className="measure mt-5 text-body-lg text-secondary">{intro}</div>}
    </AnimatedSection>
  )
}
