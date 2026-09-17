import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import ProjectImage from '@/components/ui/ProjectImage'
import type { ResolvedImage } from '@/lib/project-images'
import { distinctCredit, formatCategory } from '@/lib/utils'

export interface HeroFeature {
  slug: string
  title: string
  clientName: string
  category: string
  location: string
  year: number | null
  image: ResolvedImage
}

interface HeroProps {
  /** The one project to lead with. Null until anything has been uploaded. */
  feature?: HeroFeature | null
}

/**
 * One project, full bleed, named.
 *
 * This was four slides rotating on a five-second timer, each with its own
 * heading, and each backed by a stock photograph of somebody else's shop. It
 * cost a pause control, an aria-live region, a progress bar and a hover-suspend
 * state to stay accessible, and it still asked a first-time visitor to watch a
 * slideshow before learning what the firm does.
 *
 * A fit-out contractor is hired on evidence, so the evidence leads: one real
 * project, at full size, with the client named under it. Nothing moves, nothing
 * needs pausing, and the whole section is server-rendered — the hero now ships
 * no JavaScript at all.
 */
export default function Hero({ feature = null }: HeroProps) {
  const backdrop: ResolvedImage = feature?.image ?? {
    src: null,
    isPlaceholder: true,
    seed: 'groove-hero',
  }

  return (
    <section data-photo-hero="" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <ProjectImage image={backdrop} alt="" priority sizes="100vw" />
      </div>

      <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      <div aria-hidden="true" className="hero-wash absolute inset-0" />

      <div className="relative z-10 gutter pb-16 pt-32 sm:pb-20">
        <div className="mx-auto w-full max-w-[100rem]">
          <h1 className="max-w-[19ch] font-display text-h1 font-semibold text-white">
            Interiors delivered on the date we promised.
          </h1>

          <p className="measure-tight mt-7 text-body-lg text-white/90">
            Retail, workplace, hospitality and residential fit-outs across India. One team from
            setting out to handover, since 2016.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/projects"
              className="group inline-flex min-h-11 items-center gap-3 underline decoration-1 underline-offset-[7px] decoration-groove-gold text-meta font-medium uppercase tracking-eyebrow text-groove-gold"
            >
              See the work
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center underline decoration-1 underline-offset-[7px] decoration-white/60 text-meta font-medium uppercase tracking-eyebrow text-white/90 transition-colors hover:decoration-white hover:text-white"
            >
              Start a project
            </Link>
          </div>

          {/*
            The credit line is the point of leading with a photograph: an
            unattributed interior shot proves nothing, and could have come from
            anywhere. Naming the client and the job makes it evidence.

            It shares its rule with the scroll cue so the hero closes on one
            hairline rather than two competing ones.
          */}
          <div className="mt-14 flex items-baseline justify-between gap-8 border-t border-white/30 pt-4 text-meta">
            {feature ? (
              <p className="text-white/85">
                <Link
                  href={`/projects/${feature.slug}`}
                  className="group inline-flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <span className="font-medium text-white group-hover:text-groove-gold">
                    {feature.title}
                  </span>
                  <span aria-hidden="true" className="text-white/50">
                    ·
                  </span>
                  <span className="nums-tabular">{credit(feature)}</span>
                </Link>
              </p>
            ) : (
              <p className="text-white/80">Project photography in progress.</p>
            )}

            {/*
              The cue is a label and an arrow, not an animation. A bouncing chevron
              is motion that starts on its own and never stops, which needs a pause
              control to satisfy WCAG 2.2.2 — a disproportionate amount of
              machinery for the job of saying "there is more below".
            */}
            <p className="hidden shrink-0 items-center gap-2 uppercase tracking-eyebrow text-white/70 sm:flex">
              Scroll
              <ArrowDown size={13} aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function credit(feature: HeroFeature): string {
  return [
    distinctCredit(feature.title, feature.clientName),
    formatCategory(feature.category),
    feature.location,
    feature.year,
  ]
    .filter(Boolean)
    .join(', ')
}
