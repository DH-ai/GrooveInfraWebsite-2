import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import ProjectImage from '@/components/ui/ProjectImage'
import SectionHead from '@/components/ui/SectionHead'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Groove Infra has been building interiors across India since 2016. How the firm works, who runs it, and the eight stages every project passes through.',
  // Required on every page: without it the root layout's canonical is inherited,
  // so each page would declare itself canonical at the homepage URL.
  alternates: { canonical: '/about' },
}

const stages = [
  {
    title: 'Discovery and planning',
    desc: 'Deep-dive into your brief, site, brand and budget to establish a clear project roadmap.',
  },
  {
    title: 'Information',
    desc: 'Site surveys, technical documentation, vendor consultations and feasibility assessments.',
  },
  {
    title: 'Architecture',
    desc: 'Space planning, structural coordination and detailed layout development with your team.',
  },
  {
    title: 'Creativity',
    desc: 'Concept design, material palettes, mood boards and 3D visualisations for your sign-off.',
  },
  {
    title: 'Production',
    desc: 'Procurement, fabrication and pre-assembly of every custom element at our production units.',
  },
  {
    title: 'Technology',
    desc: 'AV, smart home, lighting control and MEP integration, coordinated with specialist consultants.',
  },
  {
    title: 'Deployment',
    desc: 'On-site construction, quality checks at every milestone, and snagging before handover.',
  },
  {
    title: 'User experience',
    desc: 'Post-handover review and client training on the systems we installed.',
  },
]

/**
 * `image` is a path under `public/team/`. Leave it unset and the entry renders a
 * monogram instead.
 *
 * The founder's portrait was previously hotlinked from media.licdn.com. Those
 * URLs are signed and expiring, and LinkedIn rejects requests it does not
 * recognise as coming from its own pages, so that image had already stopped
 * loading. Portraits have to be committed here or uploaded to storage; there is
 * no version of hotlinking a CDN we do not control that keeps working.
 */
interface TeamMember {
  name: string
  role: string
  bio: string
  image?: string
}

const team: TeamMember[] = [
  {
    name: 'Abhay Chaturvedi',
    role: 'Founder and CEO',
    bio: 'A Project Management Professional with more than 18 years in commercial interior fit-outs, business development and strategic management. Previously with Bose India, LG India and Amtek Auto. Has delivered corporate offices, warehouses, data centres, IT parks, hospitality and retail projects, and handles vendor selection, project planning, negotiation, budgeting and MIS.',
  },
]

/** Falls back to initials so a member without a committed portrait still reads as deliberate. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        label="The firm"
        title="One team, from setting out to handover."
        intro="Groove Infra has built retail, workplace, hospitality and residential interiors across India since 2016. The trades are ours, the programme is ours, and the person who priced the job is the person who hands it over."
      />

      {/*
        Three drawn plates on a square grid, where three hotlinked picsum.photos
        images used to sit under the alt text "Groove Infra at work". Once the
        client's photography is in storage these become a selection from it.
      */}
      <AnimatedSection className="mt-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface sm:col-span-2 sm:aspect-[16/9]">
            <ProjectImage
              image={{ src: null, isPlaceholder: true, seed: 'about-lead' }}
              alt=""
              sizes="(max-width: 640px) 100vw, 66vw"
              label="Site work, Delhi NCR"
            />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              <ProjectImage
                image={{ src: null, isPlaceholder: true, seed: 'about-detail' }}
                alt=""
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              <ProjectImage
                image={{ src: null, isPlaceholder: true, seed: 'about-handover' }}
                alt=""
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/*
        The story and the position it leads to, side by side. Both used to carry
        their own gold rule and caps label, which made two paragraphs of prose
        look like two separate sections of the site.
      */}
      <section className="mt-28">
        <SectionHead index="01" label="How we got here" aside="On site in Delhi, Gurgaon and Noida" />
        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
          <AnimatedSection>
            <div className="measure space-y-6 text-body-lg text-secondary">
              <p>
                Great spaces do more than look good — they shape how people behave in them. Whether
                it is a retail outlet, a workspace, a hospitality project or a commercial interior,
                every detail changes how the room is used.
              </p>
              <p>
                We have spent the years since 2016 delivering those spaces for businesses across
                India, on a foundation of craftsmanship, reliability and repeat work.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h3 className="max-w-[24ch] font-display text-h3 font-semibold text-primary">
              Construction is not only functional.
            </h3>
            <p className="measure mt-6 text-body text-secondary">
              Every project is a chance to make something that outlasts its brief — a space with
              character, purpose and the durability to still read well in ten years. That is the
              standard we price to, and the reason our clients come back with their next site.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Eight stages, as a numbered list rather than eight tiles on a grid. */}
      <section className="mt-28">
        <SectionHead
          index="02"
          label="How a project runs"
          title="Eight stages, every time."
          aside={`${stages.length} stages`}
        />

        <dl className="mt-14 border-b border-subtle">
          {stages.map((stage, i) => (
            <AnimatedSection
              key={stage.title}
              delay={Math.min(i * 0.04, 0.24)}
              className="grid grid-cols-1 gap-x-12 gap-y-2 border-t border-subtle py-7 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]"
            >
              <dt className="flex items-baseline gap-5">
                <span aria-hidden="true" className="nums-tabular text-micro text-muted-custom">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-lede font-semibold text-primary">
                  {stage.title}
                </span>
              </dt>
              <dd className="measure text-body text-secondary lg:pl-0">{stage.desc}</dd>
            </AnimatedSection>
          ))}
        </dl>
      </section>

      {/* Who runs it. One entry, so a three-column card grid left two holes. */}
      <section className="mt-28">
        <SectionHead index="03" label="Who runs it" title="The people accountable." />

        <div className="mt-14 border-b border-subtle">
          {team.map((member) => (
            <AnimatedSection key={member.name}>
              <article className="grid grid-cols-1 gap-x-12 gap-y-8 border-t border-subtle py-10 sm:grid-cols-[14rem_minmax(0,1fr)]">
                <div className="relative aspect-square w-40 overflow-hidden bg-surface sm:w-full">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 640px) 10rem, 14rem"
                    />
                  ) : (
                    <span
                      /*
                       * The name is printed alongside, so the monogram is
                       * decoration and is kept out of the accessibility tree
                       * rather than being announced a second time.
                       */
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center border border-subtle font-display text-display font-semibold text-muted-custom"
                    >
                      {initials(member.name)}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-h3 font-semibold text-primary">{member.name}</h3>
                  <p className="mt-3 text-micro uppercase tracking-eyebrow text-accent-gold">
                    {member.role}
                  </p>
                  <p className="measure mt-6 text-body text-secondary">{member.bio}</p>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <AnimatedSection className="mt-28 border-t border-strong pt-10">
        <p className="max-w-[20ch] font-display text-h2 font-semibold text-primary">
          Working to a date?
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center bg-groove-gold px-8 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
          >
            Start an enquiry
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center border-b border-strong pb-1 text-meta font-medium uppercase tracking-eyebrow text-primary transition-colors hover:border-groove-gold hover:text-accent-gold"
          >
            See the work
          </Link>
        </div>
      </AnimatedSection>
    </PageShell>
  )
}
