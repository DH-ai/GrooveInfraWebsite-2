import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'

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
    <PageShell width="reading">
      <PageHeader label={eyebrow} title={title} intro={intro}>
        <p className="nums-tabular mt-8 border-t border-subtle pt-4 text-micro uppercase tracking-eyebrow text-muted-custom">
          Last updated <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
        </p>
      </PageHeader>

      {draft && (
        <div
          role="note"
          className="mt-10 border-l-2 border-amber-400 bg-amber-500/10 px-5 py-4 text-body text-amber-100"
        >
          <strong className="font-semibold">Draft.</strong> This document describes our current
          practices but is pending legal review. Please contact us if you need a definitive answer
          on any point below.
        </div>
      )}

      {/*
        Numbered on a hairline rule, the way the rest of the site numbers a list.
        The clause number used to be part of the heading text, which put it in the
        accessible name of every section and made "1. Who we are" the thing a
        screen reader announced.
      */}
      <div className="mt-16">
        {sections.map((section, index) => (
          <section
            key={section.heading}
            aria-labelledby={`section-${index}`}
            className="border-t border-subtle py-10 first:border-t-0 first:pt-0"
          >
            <p aria-hidden="true" className="nums-tabular text-micro text-muted-custom">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h2
              id={`section-${index}`}
              className="mt-4 font-display text-h3 font-semibold text-primary"
            >
              {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-body text-secondary">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-6 border-t border-subtle">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="border-b border-subtle py-3 text-body text-secondary"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-6 border-t border-strong pt-10">
        <h2 className="font-display text-h3 font-semibold text-primary">Questions?</h2>
        <p className="measure mt-5 text-body text-secondary">
          If anything here is unclear, or you want to exercise a right described above, reach us
          through the{' '}
          <Link href="/contact" className="text-accent-gold underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </div>
    </PageShell>
  )
}
