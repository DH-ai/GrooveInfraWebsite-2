import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles, Boxes, Store, BarChart3 } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

export const metadata: Metadata = {
  title: 'Future programs',
  description:
    'Internal roadmap for digital tools, modular systems, and platforms that support how Groove Infra delivers interior construction.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

const programCards = [
  {
    icon: Sparkles,
    title: 'AI Cost Estimator',
    description:
      'Instant interior cost predictions using advanced algorithms trained on thousands of Indian interior projects. Upload your floor plan and get an accurate estimate in seconds.',
    status: 'Coming Soon',
    color: 'from-amber-500/10 to-yellow-500/5',
  },
  {
    icon: Boxes,
    title: 'Modular Interior Systems',
    description:
      'Pre-fabricated, interchangeable interior components that dramatically reduce on-site installation time and project costs while maintaining premium finish quality.',
    status: 'Coming Soon',
    color: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    icon: Store,
    title: 'Vendor Marketplace',
    description:
      'A digital platform where verified interior contractors bid for your project, driving competitive pricing and transparent procurement across all trade categories.',
    status: 'Coming Soon',
    color: 'from-purple-500/10 to-pink-500/5',
  },
  {
    icon: BarChart3,
    title: 'Project Intelligence',
    description:
      'Real-time construction analytics, milestone tracking, and predictive delay alerts that keep every stakeholder informed — from design to delivery.',
    status: 'Coming Soon',
    color: 'from-green-500/10 to-emerald-500/5',
  },
]

export default function InnovationPage() {
  return (
    <div className="min-h-screen bg-base pt-20">
      {/* Page hero */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-groove-gold" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Future programs
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary leading-tight mb-6">
            Groove Infra
            <br />
            Future programs
          </h1>
          <p className="text-secondary text-xl leading-relaxed max-w-xl">
            Reimagining how interior construction is delivered — with stronger tooling, modular
            systems, and data where it helps. Building smarter, faster, and more sustainable spaces.
          </p>
        </AnimatedSection>
      </section>

      {/* Program cards */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {programCards.map((item, i) => {
            const Icon = item.icon
            return (
              <AnimatedSection key={item.title} delay={i * 0.08}>
                <div className={`relative group rounded-2xl border border-subtle bg-surface-2 p-8 overflow-hidden hover:border-groove-gold/20 transition-all duration-300 hover:shadow-glass`}>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Icon + Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-groove-gold/10 flex items-center justify-center group-hover:bg-groove-gold/20 transition-colors duration-300">
                        <Icon size={20} className="text-accent-gold" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full border border-groove-gold/30 text-accent-gold">
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-primary text-xl mb-3 group-hover:text-accent-gold transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-20 bg-surface border-y border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-groove-gold" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                  Our Vision
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-6 leading-tight">
                The Future of
                <br />
                Interior Construction
              </h2>
              <div className="space-y-4 text-secondary leading-relaxed">
                <p>
                  At Groove Infra, we believe the future of commercial interior construction lies at
                  the intersection of technology, creativity, and craftsmanship. Our team is dedicated
                  to developing solutions that make interior construction faster, smarter, and more
                  sustainable.
                </p>
                <p>
                  We&apos;re investing in AI-powered cost estimation, modular interior systems,
                  digital vendor platforms, and real-time project analytics to transform how
                  commercial spaces are built across India.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="rounded-2xl border border-subtle bg-base p-8">
                <h3 className="font-display text-xl font-bold text-primary mb-4">
                  Interested in these initiatives?
                </h3>
                <p className="text-secondary text-sm leading-relaxed mb-6">
                  Let&apos;s discuss how we can leverage cutting-edge technology to transform your
                  commercial interior projects. Early adopters will get priority access to our
                  platform tools.
                </p>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold transition-all duration-300 hover:scale-105"
                >
                  Get in Touch
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
