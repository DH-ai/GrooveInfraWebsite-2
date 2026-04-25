import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Groove Infra — 12+ years of building premium interior spaces across India. Our story, philosophy, team, and working process.',
}

const workingPhases = [
  { num: '01', title: 'Discovery & Planning', desc: 'Deep-dive into your brief, site, brand, and budget to establish a crystal-clear project roadmap.' },
  { num: '02', title: 'Information', desc: 'Site surveys, technical documentation, vendor consultations, and feasibility assessments.' },
  { num: '03', title: 'Architecture', desc: 'Space planning, structural coordination, and detailed layout development with your team.' },
  { num: '04', title: 'Creativity', desc: 'Concept design, material palettes, mood boards, and 3D visualisations for your sign-off.' },
  { num: '05', title: 'Production', desc: 'Procurement, fabrication, and pre-assembly of all custom elements at our production units.' },
  { num: '06', title: 'Technology', desc: 'AV, smart home, lighting control, and MEP integration coordinated with specialist consultants.' },
  { num: '07', title: 'Deployment', desc: 'On-site construction, quality checks at every milestone, and snagging before handover.' },
  { num: '08', title: 'User Experience', desc: 'Post-handover review, client training on installed systems, and a 12-month warranty period.' },
]

const team = [
  {
    name: 'Abhay',
    role: 'Founder & CEO',
    image: 'https://picsum.photos/seed/team-abhay/400/400',
    bio: 'Visionary entrepreneur with 15+ years in commercial construction. Built Groove Infra from a small fit-out team into one of India\'s most trusted interior construction firms.',
  },
  {
    name: 'Dhruv Chaturvedi',
    role: 'Chief Technology Officer',
    image: 'https://picsum.photos/seed/team-dhruv/400/400',
    bio: 'Leads technology, digital systems, and the innovation roadmap at Groove Infra. Passionate about using technology to transform how interior projects are planned and delivered.',
  },
  {
    name: 'Rohit Chaturvedi',
    role: 'Chief Design Officer',
    image: 'https://picsum.photos/seed/team-rohit/400/400',
    bio: 'Award-winning designer responsible for Groove Infra\'s creative direction. Every project that leaves our studio carries Rohit\'s signature balance of aesthetics and function.',
  },
]

const serviceAreas = ['Delhi', 'Gurgaon', 'Noida', 'Jaipur', 'Mumbai']

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base pt-20">
      {/* Page hero */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-groove-gold" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Our Story
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary leading-tight mb-6">
            Built on Craft.
            <br />
            Driven by Vision.
          </h1>
          <p className="text-secondary text-xl leading-relaxed max-w-xl">
            Since 2012, Groove Infra has been transforming empty spaces into experiences — retail
            environments that sell, offices that inspire, hospitality spaces that linger in memory.
          </p>
        </AnimatedSection>
      </section>

      {/* Image collage */}
      <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="grid grid-cols-3 gap-3" style={{ height: '440px' }}>
            <div className="col-span-2 relative rounded-2xl overflow-hidden">
              <Image src="https://picsum.photos/seed/about-main/1200/800" alt="Groove Infra at work" fill className="object-cover" sizes="66vw" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative flex-1 rounded-2xl overflow-hidden">
                <Image src="https://picsum.photos/seed/about-2/600/400" alt="Project detail" fill className="object-cover" sizes="33vw" />
              </div>
              <div className="relative flex-1 rounded-2xl overflow-hidden">
                <Image src="https://picsum.photos/seed/about-3/600/400" alt="Completed space" fill className="object-cover" sizes="33vw" />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Our Story */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Our Story
              </span>
            </div>
            <div className="space-y-5 text-secondary leading-relaxed text-lg">
              <p>
                Groove Infra was founded on a simple belief: that the built environment shapes
                human behaviour. A well-designed retail store increases dwell time and sales. A
                thoughtful office reduces friction and boosts productivity. A beautifully executed
                hotel lobby sets the tone for every guest experience.
              </p>
              <p>
                Over 12 years, we&apos;ve delivered 200+ projects for brands ranging from D2C
                startups to Fortune 500 companies — each one a testament to our obsession with
                detail, rigour in execution, and commitment to keeping promises.
              </p>
            </div>
          </AnimatedSection>

          {/* Philosophy */}
          <AnimatedSection delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Our Philosophy
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-primary mb-5">
              Where Interior Construction Meets Artistry
            </h2>
            <p className="text-secondary leading-relaxed mb-5">
              We reject the notion that construction is purely functional. Every project is an
              opportunity to create something that outlasts the brief — a space with genuine
              character, embedded purpose, and long-term durability.
            </p>
            <p className="text-secondary leading-relaxed">
              Our 80+ team of architects, project managers, site engineers, and craftspeople work
              as one seamless unit, ensuring that what is designed is exactly what gets built.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Our Working — 8 phases */}
      <section className="py-20 bg-surface border-y border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Our Working
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary max-w-xl">
              How Every Project Comes Alive
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-subtle">
            {workingPhases.map((phase, i) => (
              <AnimatedSection
                key={phase.num}
                delay={i * 0.05}
                className="bg-surface p-7 group hover:bg-base transition-colors duration-300"
              >
                <div className="text-xs font-mono text-muted-custom mb-4">{phase.num}</div>
                <h3 className="font-display font-semibold text-primary text-base mb-3 group-hover:text-accent-gold transition-colors duration-300">
                  {phase.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">{phase.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-groove-gold" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Our Team
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">
            The People Behind the Work
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <AnimatedSection key={member.name} delay={i * 0.1}>
              <div className="group">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-5 bg-surface-2">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="font-display font-semibold text-primary text-xl mb-0.5">
                  {member.name}
                </h3>
                <p className="text-xs font-medium tracking-wider uppercase text-accent-gold mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-secondary leading-relaxed">{member.bio}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-surface border-y border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-center gap-10">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-groove-gold" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                  Service Areas
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-primary">We Operate Across</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {serviceAreas.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-subtle text-sm text-secondary hover:border-groove-gold/40 hover:text-primary transition-colors duration-200"
                >
                  <MapPin size={11} className="text-accent-gold" />
                  {city}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Ready to Transform */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            Whether it&apos;s a single store or a 50-city rollout — we&apos;re ready to build.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold transition-all duration-300 hover:scale-105"
            >
              Get in Touch
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-subtle text-secondary hover:text-primary hover:border-groove-gold/40 text-sm transition-all duration-300"
            >
              View Projects
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
