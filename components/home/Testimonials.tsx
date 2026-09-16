'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Testimonial } from '@/types/project'
import { formatCategory } from '@/lib/utils'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  if (!testimonials.length) return null

  const current = testimonials[index]

  function next() {
    setDirection(1)
    setIndex((i) => (i + 1) % testimonials.length)
  }

  function prev() {
    setDirection(-1)
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-28 bg-surface border-y border-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
            Client Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mt-3">
            What Our Clients Say
          </h2>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          {/* Quote icon */}
          <AnimatedSection className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-groove-gold/10 flex items-center justify-center">
              <Quote size={20} className="text-accent-gold" />
            </div>
          </AnimatedSection>

          {/* Testimonial */}
          <div className="relative min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center"
              >
                <blockquote className="font-display text-xl sm:text-2xl md:text-3xl font-medium text-primary leading-relaxed mb-8">
                  &ldquo;{current.text}&rdquo;
                </blockquote>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold text-primary">{current.client}</span>
                  <span className="text-sm text-secondary">{current.project}</span>
                  <span className="text-xs text-muted-custom mt-1 px-3 py-0.5 rounded-full border border-subtle">
                    {formatCategory(current.category)}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-strong text-secondary transition-colors duration-200 hover:border-groove-gold/60 hover:text-primary"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            {/*
              The visible dot stays small; the button around it is a full-size hit
              area. Previously the target was the 6px dot itself.
            */}
            <div className="flex">
              {testimonials.map((t, i) => (
                <button
                  key={t.client}
                  type="button"
                  onClick={() => {
                    setDirection(i > index ? 1 : -1)
                    setIndex(i)
                  }}
                  aria-current={i === index}
                  aria-label={`Show testimonial ${i + 1} of ${testimonials.length}: ${t.client}`}
                  className="group flex h-11 w-6 items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className={`rounded-full transition-all duration-300 ${
                      i === index
                        ? 'h-1.5 w-5 bg-groove-gold'
                        : 'h-1.5 w-1.5 bg-subtle group-hover:bg-groove-gold/50'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-strong text-secondary transition-colors duration-200 hover:border-groove-gold/60 hover:text-primary"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
