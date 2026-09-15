import Link from 'next/link'

/**
 * Shared shell for the privacy policy and terms pages, so the two stay
 * typographically identical and only their content differs.
 */

export interface LegalSection {
  heading: string
  /** Each entry renders as its own paragraph. */
  body: string[]
  bullets?: string[]
}

interface LegalPageProps {
  title: string
  /** Shown above the title, e.g. "Legal". */
  eyebrow: string
  /** ISO date of the last substantive revision. */
  lastUpdated: string
  intro: string
  sections: LegalSection[]
  /**
   * Renders a visible "awaiting review" banner. The wording of these pages
   * describes what the site actually does, but it is not legal advice and has
   * not been checked by a solicitor. Drop this prop once the final copy is
   * approved, so the pages never quietly imply a review that did not happen.
   */
  draft?: boolean
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function LegalPage({
  title,
  eyebrow,
  lastUpdated,
  intro,
  sections,
  draft = false,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-base pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-12 bg-groove-gold" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
            {eyebrow}
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
          {title}
        </h1>

        <p className="mt-4 text-xs uppercase tracking-widest text-muted-custom">
          Last updated{' '}
          <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
        </p>

        {draft && (
          <div
            role="note"
            className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-100"
          >
            <strong className="font-semibold">Draft.</strong> This document describes our current
            practices but is pending legal review. Please contact us if you need a definitive
            answer on any point below.
          </div>
        )}

        <p className="mt-8 text-secondary leading-relaxed">{intro}</p>

        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`section-${index}`}>
              <h2
                id={`section-${index}`}
                className="font-display text-xl font-semibold text-primary"
              >
                {index + 1}. {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-secondary leading-relaxed">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-groove-gold" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-subtle bg-surface-2 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">Questions?</h2>
          <p className="mt-2 text-sm text-secondary leading-relaxed">
            If anything here is unclear, or you want to exercise a right described above, reach
            us through the{' '}
            <Link href="/contact" className="text-accent-gold underline underline-offset-4">
              contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
