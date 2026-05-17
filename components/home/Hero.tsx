'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDE_INTERVAL_MS = 6000

const slides = [
  {
    tag: 'Retail Rollouts',
    heading: ['Spaces That', 'Drive Sales'],
    sub: "End-to-end retail fit-outs for India's fastest-growing brands.",
  },
  {
    tag: 'Commercial Interiors',
    heading: ['Where Work', 'Becomes Culture'],
    sub: 'Corporate environments engineered for performance and identity.',
  },
  {
    tag: 'Hospitality & Clubs',
    heading: ['Atmospheres', 'People Return To'],
    sub: 'Hotels, restaurants, and lounges built to leave a lasting impression.',
  },
  {
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

      {/* ── Right panel: CSS-only art (no external images) ── */}
      <div className="hidden lg:block relative flex-1 overflow-hidden hero-art-panel">
        {/* Ambient blobs */}
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />

        {/* Spinning rings */}
        <div className="hero-ring" />
        <div className="hero-ring-outer" />

        {/* Ghost outline typography */}
        <span className="hero-bg-text" aria-hidden="true">INFRA</span>

        {/* Stats strip at the bottom */}
        <div className="hero-stat-strip">
          {[
            { n: '200+', l: 'Projects' },
            { n: '12+',  l: 'Years' },
            { n: '50+',  l: 'Brands' },
            { n: '98%',  l: 'On-Time' },
          ].map((s) => (
            <div key={s.l} className="hero-stat-item">
              <div className="hero-stat-number">{s.n}</div>
              <div className="hero-stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Category label card — transitions with current slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${current}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="absolute top-12 right-10 border border-white/10 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(8,12,20,0.55)', backdropFilter: 'blur(12px)' }}
          >
            <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Currently showing</p>
            <p className="text-white font-display font-semibold text-sm">{slides[current].tag}</p>
            <Link
              href="/projects"
              className="mt-2.5 inline-flex items-center gap-1.5 text-groove-copper text-xs font-medium hover:gap-2.5 transition-all duration-200"
            >
              View portfolio <ArrowUpRight size={11} />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Auto-play progress bar */}
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

      {/* Mobile: art panel as full-screen background */}
      <div className="absolute inset-0 lg:hidden -z-10 hero-art-panel">
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-ring" />
      </div>
    </section>
  )
}
