'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const stats = [
  { value: 150, suffix: '+', label: 'Projects Delivered', description: 'Across retail, office & hospitality' },
  { value: 25, suffix: '+', label: 'Brands', description: 'Retail, commercial & hospitality partners' },
  { value: 11, suffix: '+', label: 'Years of Experience', description: 'Trusted since 2016' },
  { value: 96, suffix: '%', label: 'One-Time Completion', description: 'Precision execution, every time' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export default function Stats() {
  return (
    <section className="py-24 bg-surface border-y border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
            By the Numbers
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mt-3">
            A Decade of Precision
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-subtle">
          {stats.map((stat, i) => (
            <AnimatedSection
              key={stat.label}
              delay={i * 0.1}
              className="flex flex-col items-center text-center px-8 py-6 group"
            >
              <span className="font-display text-4xl sm:text-5xl font-bold text-primary mb-1 group-hover:text-accent-gold transition-colors duration-300">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-sm font-semibold text-primary mb-1">{stat.label}</span>
              <span className="text-xs text-secondary text-center">{stat.description}</span>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
