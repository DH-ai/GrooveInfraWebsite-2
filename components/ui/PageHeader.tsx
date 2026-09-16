import AnimatedSection from '@/components/ui/AnimatedSection'

interface PageHeaderProps {
  label: string
  title: React.ReactNode
  intro?: React.ReactNode
  /** Meta or actions that belong with the header, e.g. a revision date. */
  children?: React.ReactNode
  className?: string
}

/**
 * How every page opens: a label, the title, and a standfirst.
 *
 * Five pages each built this themselves out of a 48px gold rule, a 12px letter-
 * spaced caps label and a `text-5xl sm:text-6xl md:text-7xl` heading. Because the
 * sizes were written out by hand they had all drifted apart, and the decorative
 * rule beside the label was doing the job the label's own capitals already do.
 *
 * The heading is capped at 20 characters per line. A display serif set across a
 * full-width column reads as a banner rather than a sentence, and the cap is what
 * gives these openers the same shape as the ones on the homepage.
 */
export default function PageHeader({
  label,
  title,
  intro,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <AnimatedSection className={className}>
      <p className="text-micro uppercase tracking-eyebrow text-accent-gold">{label}</p>

      <h1 className="mt-8 max-w-[20ch] font-display text-h1 font-semibold text-primary">{title}</h1>

      {intro && <div className="measure mt-8 text-body-lg text-secondary">{intro}</div>}

      {children}
    </AnimatedSection>
  )
}
