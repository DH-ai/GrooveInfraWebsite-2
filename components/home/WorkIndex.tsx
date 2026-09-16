import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ProjectImage from '@/components/ui/ProjectImage'
import SectionHead from '@/components/ui/SectionHead'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { ResolvedImage } from '@/lib/project-images'
import { distinctCredit, formatCategory } from '@/lib/utils'

export interface WorkIndexEntry {
  slug: string
  title: string
  clientName: string
  category: string
  location: string
  year: number | null
  image: ResolvedImage
}

interface WorkIndexProps {
  entries: WorkIndexEntry[]
}

/**
 * The portfolio as an index rather than a marquee.
 *
 * What was here before was an infinite horizontal scroller, duplicated in the
 * DOM so the loop had no seam, running on a CSS translate that never stopped. It
 * needed a pause control to satisfy WCAG 2.2.2, hid half its contents off-screen
 * at any moment, and gave no way to scan the list or read a project's facts
 * without chasing a moving target.
 *
 * A numbered index is how a studio actually presents work: every project
 * readable at once, in order, with the client and the year in line. Nothing
 * moves on its own, so there is nothing to pause, and it is entirely
 * server-rendered.
 */
export default function WorkIndex({ entries }: WorkIndexProps) {
  if (entries.length === 0) return null

  return (
    <section className="section-y gutter">
      <div className="mx-auto w-full max-w-[100rem]">
        <SectionHead
          index="01"
          label="Selected work"
          title="Projects handed over, not renders."
          aside={`${entries.length} shown`}
        />

        {/*
          The reveal wrapper sits inside the `li`, not around it: an `ol` may only
          contain `li`, and a div between the two breaks both the list and its
          items for anything reading the page as a list.
        */}
        <ol className="mt-14 border-b border-subtle">
          {entries.map((entry, i) => (
            <li key={entry.slug} className="border-t border-subtle">
              <AnimatedSection delay={Math.min(i * 0.06, 0.3)}>
                <Link
                  href={`/projects/${entry.slug}`}
                  className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-5 py-6 sm:grid-cols-[3rem_1fr_auto_auto] sm:gap-x-8"
                >
                  <span
                    aria-hidden="true"
                    className="nums-tabular text-micro text-muted-custom sm:self-start sm:pt-2"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0">
                    <span className="block font-display text-h3 font-semibold text-primary transition-colors duration-300 group-hover:text-accent-gold">
                      {entry.title}
                    </span>
                    <span className="mt-2 block text-meta text-muted-custom">
                      {[
                        distinctCredit(entry.title, entry.clientName),
                        formatCategory(entry.category),
                        entry.location,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>

                  {/*
                    Ordered after the text in the source so a screen reader hears
                    the project before its decorative thumbnail, and placed by
                    grid rather than by document order on wide screens.
                  */}
                  <span className="col-span-2 block w-full overflow-hidden sm:col-span-1 sm:order-last sm:w-[13rem] lg:w-[17rem]">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-surface">
                      <ProjectImage
                        image={entry.image}
                        alt=""
                        sizes="(min-width: 1024px) 17rem, (min-width: 640px) 13rem, 100vw"
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                  </span>

                  <span className="hidden items-baseline gap-6 sm:flex">
                    {entry.year && (
                      <span className="nums-tabular text-meta text-muted-custom">{entry.year}</span>
                    )}
                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="text-muted-custom transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-gold"
                    />
                  </span>
                </Link>
              </AnimatedSection>
            </li>
          ))}
        </ol>

        <AnimatedSection className="mt-10">
          <Link
            href="/projects"
            className="group inline-flex min-h-11 items-center gap-3 border-b border-strong pb-1 text-meta font-medium uppercase tracking-eyebrow text-primary transition-colors hover:border-groove-gold hover:text-accent-gold"
          >
            The full portfolio
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
