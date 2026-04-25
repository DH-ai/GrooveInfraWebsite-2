'use client'

import { ShoppingBag, Building2, Utensils, Home } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const services = [
  {
    icon: ShoppingBag,
    title: 'Retail Rollouts',
    description:
      'End-to-end store fit-outs for retail brands at any scale — from single flagships to nationwide rollouts. POS counters, display fixtures, lighting, and more.',
    number: '01',
  },
  {
    icon: Utensils,
    title: 'Hospitality & Clubs',
    description:
      'Hotels, restaurants, lounges, nightclubs, and spas. We create atmospheric spaces that turn first-time visitors into returning guests.',
    number: '02',
  },
  {
    icon: Building2,
    title: 'Commercial Renovation',
    description:
      'Office headquarters, co-working spaces, clinics, and showrooms. Modern commercial interiors built for performance and lasting brand identity.',
    number: '03',
  },
  {
    icon: Home,
    title: 'Residential Makeovers',
    description:
      'Premium apartments, penthouses, and villas crafted to reflect personal taste. Precision joinery, bespoke furniture, and smart home integration.',
    number: '04',
  },
]

export default function Services() {
  return (
    <section className="py-28 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-groove-gold" />
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

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-subtle">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <AnimatedSection
                key={service.title}
                delay={i * 0.07}
                className="bg-base p-8 group hover:bg-surface-2 transition-colors duration-300"
              >
                <div className="text-xs font-mono text-muted-custom mb-8">{service.number}</div>
                <div className="w-9 h-9 rounded-lg bg-groove-gold/10 flex items-center justify-center mb-6 group-hover:bg-groove-gold/20 transition-colors duration-300">
                  <Icon size={17} className="text-accent-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-primary text-lg mb-3 group-hover:text-accent-gold transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">{service.description}</p>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
