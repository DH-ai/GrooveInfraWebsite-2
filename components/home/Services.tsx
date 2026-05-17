'use client'

import { useState } from 'react'
import { ShoppingBag, Building2, Utensils, Home, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

const services = [
  {
    icon: ShoppingBag,
    title: 'Retail Rollouts',
    description:
      'End-to-end store fit-outs for retail brands at any scale — from single flagships to nationwide rollouts. POS counters, display fixtures, lighting, and more.',
    number: '01',
    href: '/projects?category=retail',
  },
  {
    icon: Utensils,
    title: 'Hospitality & Clubs',
    description:
      'Hotels, restaurants, lounges, nightclubs, and spas. We create atmospheric spaces that turn first-time visitors into returning guests.',
    number: '02',
    href: '/projects?category=commercial',
  },
  {
    icon: Building2,
    title: 'Commercial Renovation',
    description:
      'Office headquarters, co-working spaces, clinics, and showrooms. Modern commercial interiors built for performance and lasting brand identity.',
    number: '03',
    href: '/projects?category=commercial',
  },
  {
    icon: Home,
    title: 'Residential Makeovers',
    description:
      'Premium apartments, penthouses, and villas crafted to reflect personal taste. Precision joinery, bespoke furniture, and smart home integration.',
    number: '04',
    href: '/projects?category=residential',
  },
]

export default function Services() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="py-28 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-groove-copper" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              What We Do
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end gap-8">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight flex-1 max-w-md">
              Comprehensive
              <br />
              Interior Solutions
            </h2>
            <p className="text-secondary text-sm leading-relaxed max-w-xs lg:pb-1">
              From a single store to a 100-city rollout — we deliver interiors that work
              beautifully and last for years.
            </p>
          </div>
        </AnimatedSection>

        {/* Editorial numbered list */}
        <div className="divide-y divide-subtle">
          {services.map((service, i) => {
            const Icon = service.icon
            const isHovered = hovered === i
            return (
              <AnimatedSection key={service.title} delay={i * 0.05}>
                <Link
                  href={service.href}
                  className="group flex items-start gap-6 sm:gap-10 py-8 sm:py-10 cursor-pointer"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Number */}
                  <span className="font-mono text-[11px] tracking-widest text-muted-custom pt-2 flex-none w-6">
                    {service.number}
                  </span>

                  {/* Icon (visible on hover) */}
                  <div
                    className={`flex-none w-9 h-9 rounded-lg flex items-center justify-center mt-1 transition-all duration-300 ${
                      isHovered
                        ? 'bg-groove-copper/15 opacity-100 scale-100'
                        : 'bg-surface-2 opacity-50 scale-95'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`transition-colors duration-300 ${
                        isHovered ? 'text-groove-copper' : 'text-secondary'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-display text-2xl sm:text-3xl font-bold leading-tight transition-colors duration-300 mb-0 ${
                        isHovered ? 'text-groove-copper' : 'text-primary'
                      }`}
                    >
                      {service.title}
                    </h3>
                    <div className={`service-description${isHovered ? ' is-visible' : ''}`}>
                      <p className="text-sm text-secondary leading-relaxed mt-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div
                    className={`flex-none mt-2 transition-all duration-300 ${
                      isHovered
                        ? 'opacity-100 translate-x-0 text-groove-copper'
                        : 'opacity-0 -translate-x-2 text-muted-custom'
                    }`}
                  >
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
