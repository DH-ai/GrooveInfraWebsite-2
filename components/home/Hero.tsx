'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDE_INTERVAL_MS = 6000

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
    const id = setInterval(next, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <section
      className="flex min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Left panel: text ── */}
      <div className="relative z-10 w-full lg:w-[44%] flex flex-col bg-groove-navy px-8 sm:px-12 pt-28 pb-10">
        {/* Slide counter row */}
        <div className="flex items-center gap-4 mb-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[11px] text-groove-copper tracking-widest"
            >
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.52, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {/* Tag */}
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.3em] uppercase text-groove-copper mb-6">
                <span className="w-1 h-1 rounded-full bg-groove-copper" />
                {slides[current].tag}
              </span>

              {/* Heading */}
              <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold text-white leading-[1.02] tracking-tight mb-6">
                {slides[current].heading[0]}
                <br />
                {slides[current].heading[1]}
              </h1>

              {/* Sub */}
              <p className="text-white/50 text-base max-w-sm mb-10 leading-relaxed">
                {slides[current].sub}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-groove-copper text-white font-medium text-sm hover:bg-groove-copper-dark transition-all duration-300 hover:scale-105"
                >
                  View Our Work
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:border-white/35 hover:text-white transition-all duration-300"
                >
                  Start a Project
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: dots + arrows */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-7 h-1.5 bg-groove-copper'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-full border border-white/12 text-white/40 hover:text-white hover:border-white/25 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full bg-groove-copper text-white hover:bg-groove-copper-dark transition-all flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right panel: image ── */}
      <div className="hidden lg:block relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${current}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={slides[current].image}
              alt={slides[current].tag}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="56vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle vertical gradient at left edge to blend with dark panel */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-groove-navy to-transparent" />

        {/* Caption card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${current}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="absolute bottom-8 left-8 bg-black/65 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-[220px]"
          >
            <p className="text-white/45 text-[10px] uppercase tracking-widest mb-1.5">
              {slides[current].tag}
            </p>
            <p className="text-white font-display font-semibold text-sm leading-snug">
              {slides[current].heading[0]} {slides[current].heading[1]}
            </p>
            <Link
              href="/projects"
              className="mt-3 inline-flex items-center gap-1.5 text-groove-copper text-xs font-medium hover:gap-2.5 transition-all duration-200"
            >
              View portfolio <ArrowUpRight size={11} />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Auto-play progress bar at the very bottom */}
        {!paused && (
          <motion.div
            key={`prog-${current}`}
            className="absolute bottom-0 left-0 h-[2px] bg-groove-copper/70 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' }}
            style={{ width: '100%' }}
          />
        )}
      </div>

      {/* Mobile: show image as full background (small screens only) */}
      <div className="absolute inset-0 lg:hidden -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mob-bg-${current}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={slides[current].image}
              alt={slides[current].tag}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-groove-navy/85" />
      </div>
    </section>
  )
}
