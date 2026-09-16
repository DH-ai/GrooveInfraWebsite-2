import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Quote } from 'lucide-react'
import ProjectGallery from '@/components/projects/ProjectGallery'
import AnimatedSection from '@/components/ui/AnimatedSection'
import ProjectImage from '@/components/ui/ProjectImage'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'
import { absoluteUrl } from '@/lib/site'
import { distinctCredit, formatCategory } from '@/lib/utils'

interface PageProps {
  params: { slug: string }
}

// Without a revalidate window these pages are prerendered once and cached
// forever, which bakes in a 404 for any project that did not exist at build
// time and leaves renamed projects permanently stale. Admin mutations also flush
// the affected slug via revalidateProjectSurfaces.
export const revalidate = 300

// Projects added after a deploy are not in generateStaticParams, so they must be
// allowed to render on demand rather than 404.
export const dynamicParams = true

export async function generateStaticParams() {
  const all = await getAllProjects()
  return all.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}

  const description = project.basic_description ?? project.description
  const canonical = `/projects/${project.slug}`

  /*
   * Only a real photograph is worth putting on a social card. A drawn placeholder
   * has no `src` to link to, and a bare tonal field would make a worse preview
   * than the site-wide generated card that Next falls back to, so placeholders
   * are omitted rather than rendered into the OG image.
   */
  const cover = project.imagery.cover.src

  return {
    title: project.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: project.title,
      description,
      url: absoluteUrl(canonical),
      ...(cover ? { images: [{ url: cover, alt: project.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  const { imagery } = project

  /*
   * The hero already shows the cover at full bleed, and `resolveProjectImagery`
   * always puts the cover first in the gallery, so the sequence starts one frame
   * in. Without this the page opened with the same photograph twice: once full
   * screen, then again as Fig. 01 directly beneath it.
   */
  const sequence = imagery.gallery.slice(1)

  /*
   * The facts a fit-out client checks first, in the order they check them.
   * Rendered as a definition list on a hairline grid rather than as rows of
   * icons in tinted squares: an icon adds nothing to "Area — 4,200 sq ft", and
   * four of them in a column turn the one part of the page that is pure data
   * into decoration.
   */
  const facts = [
    { label: 'Client', value: project.client_name },
    { label: 'Sector', value: formatCategory(project.category) },
    project.location && { label: 'Location', value: project.location },
    project.year && { label: 'Completed', value: String(project.year) },
    project.area && { label: 'Area', value: project.area },
    project.duration && { label: 'On site', value: project.duration },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <article className="bg-base">
      {/*
        Full bleed and full height. A fit-out is sold on the finished room, so the
        photograph gets the screen before anything else competes with it — the
        title sits over its lower edge where the scrim is darkest.
      */}
      <header className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden bg-surface">
        <div className="absolute inset-0">
          <ProjectImage image={imagery.cover} alt={project.title} sizes="100vw" priority />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg))] via-black/40 to-black/25"
        />

        <div className="relative z-10 gutter pb-14 pt-32">
          <div className="mx-auto w-full max-w-[100rem]">
            <p className="text-micro uppercase tracking-eyebrow text-groove-gold">
              {formatCategory(project.category)}
            </p>
            <h1 className="mt-6 max-w-[24ch] font-display text-h1 font-semibold text-white">
              {project.title}
            </h1>
            {project.basic_description && (
              <p className="measure-tight mt-7 text-body-lg text-white/85">
                {project.basic_description}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="gutter section-y">
        <div className="mx-auto w-full max-w-[100rem]">
          <AnimatedSection>
            <Link
              href="/projects"
              className="group inline-flex min-h-11 items-center gap-3 text-micro uppercase tracking-eyebrow text-muted-custom transition-colors hover:text-primary"
            >
              <ArrowLeft
                size={13}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1"
              />
              All projects
            </Link>
          </AnimatedSection>

          {/*
            The narrative and the data sit side by side at the top of the page
            because they answer different questions and a client checks both
            before scrolling: what was this, and what size and shape was it.
          */}
          <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <AnimatedSection>
              <h2 className="text-micro uppercase tracking-eyebrow text-accent-gold">The brief</h2>
              <p className="measure mt-8 text-lede font-medium text-primary">
                {project.description}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-accent-gold">
                Particulars
              </h2>
              <dl className="mt-2">
                {facts.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-6 border-b border-subtle py-4"
                  >
                    <dt className="text-meta text-muted-custom">{label}</dt>
                    <dd className="nums-tabular text-right text-meta font-medium text-primary">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {project.tags && project.tags.length > 0 && (
                <div className="mt-10">
                  <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-accent-gold">
                    Scope of works
                  </h2>
                  <ul className="mt-2">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border-b border-subtle py-3 text-meta text-secondary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AnimatedSection>
          </div>

          {/*
            Gated on owned photography rather than on the gallery being
            non-empty. A project with nothing uploaded still has plates to fill
            its hero, but a "Gallery" heading over a grid of drawn plates would
            promise photographs of the finished space and then offer a lightbox
            that zooms into a texture — padding the page with a dead end. The
            hero plate carries the page; the gallery appears when there is
            something to show.
          */}
          {imagery.hasOwnPhotography && sequence.length > 0 && (
            <AnimatedSection className="mt-24">
              <div className="flex items-baseline justify-between gap-6 border-t border-strong pt-4">
                <h2 className="text-micro uppercase tracking-eyebrow text-accent-gold">
                  Gallery
                </h2>
                <p className="nums-tabular text-meta text-muted-custom">
                  {sequence.length} {sequence.length === 1 ? 'frame' : 'frames'}
                </p>
              </div>
              <div className="mt-10">
                <ProjectGallery images={sequence} title={project.title} />
              </div>
            </AnimatedSection>
          )}

          {project.testimonial && (
            <AnimatedSection className="mt-24">
              <figure className="border-t border-strong pt-10">
                <Quote size={22} aria-hidden="true" className="text-accent-gold" />
                <blockquote className="measure mt-6 font-display text-h3 font-medium text-primary">
                  {project.testimonial}
                </blockquote>
                <figcaption className="mt-7 text-meta text-muted-custom">
                  <span className="font-medium text-primary">{project.client_name}</span>
                  {distinctCredit(project.client_name, project.title) && (
                    <>
                      <span aria-hidden="true" className="px-2 text-muted-custom/50">
                        ·
                      </span>
                      {project.title}
                    </>
                  )}
                </figcaption>
              </figure>
            </AnimatedSection>
          )}

          <AnimatedSection className="mt-24 border-t border-strong pt-10">
            <p className="max-w-[20ch] font-display text-h3 font-semibold text-primary">
              Working to a date like this one?
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex min-h-11 items-center bg-groove-gold px-7 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
            >
              Start an enquiry
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </article>
  )
}
