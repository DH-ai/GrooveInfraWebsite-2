'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
    tag: 'Retail Rollouts',
    heading: ['Spaces That', 'Drive Sales'],
    sub: "End-to-end retail fit-outs for India's fastest-growing brands.",
  },
  {
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    tag: 'Commercial Interiors',
    heading: ['Where Work', 'Becomes Culture'],
    sub: 'Corporate environments engineered for performance and identity.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80',
    tag: 'Hospitality & Clubs',
    heading: ['Atmospheres', 'People Return To'],
    sub: 'Hotels, restaurants, and lounges built to leave a lasting impression.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80',
    tag: 'Residential Makeovers',
    heading: ['Your Home,', 'Reimagined'],
    sub: 'Bespoke residential interiors crafted to reflect who you are.',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5500)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background slide images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0 scale-[1.04]"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.04 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={slides[current].image}
            alt={slides[current].tag}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Blur + dark overlays */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/75" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col justify-center pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="max-w-3xl"
          >
            {/* Tag */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-groove-gold text-xs font-medium tracking-[0.22em] uppercase">
                {slides[current].tag}
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.04] tracking-tight mb-6">
              {slides[current].heading[0]}
              <br />
              <span className="text-gradient-gold">{slides[current].heading[1]}</span>
            </h1>

            {/* Subheading */}
            <p className="text-white/65 text-lg sm:text-xl max-w-md mb-10 leading-relaxed">
              {slides[current].sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold-hover transition-all duration-300 hover:scale-105"
              >
                View Our Work
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white text-sm font-medium hover:border-white/50 hover:bg-white/5 transition-all duration-300"
              >
                Start a Project
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide counter */}
        <div className="absolute bottom-12 right-6 sm:right-10 flex items-center gap-3">
          <span className="font-display text-5xl font-bold text-white/20 tabular-nums leading-none">
            0{current + 1}
          </span>
          <span className="text-white/30 text-sm">/ 0{slides.length}</span>
        </div>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === current
                ? 'w-7 h-1.5 bg-groove-gold'
                : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Auto-play progress bar */}
      {!paused && (
        <motion.div
          key={`progress-${current}`}
          className="absolute bottom-0 left-0 h-[2px] bg-groove-gold/60 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5.5, ease: 'linear' }}
          style={{ width: '100%' }}
        />
      )}
    </section>
  )
}
