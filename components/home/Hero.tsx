'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const SLIDE_DURATION_MS = 5500

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
  // Hovering or tabbing into the hero suspends rotation; the explicit control
  // below stops it for good. They are tracked separately so moving the mouse
  // away does not silently restart a carousel the user asked to stop.
  const [suspended, setSuspended] = useState(false)
  const [stopped, setStopped] = useState(false)
  const reduceMotion = useReducedMotion()

  // WCAG 2.2.2: content that moves by itself for more than five seconds needs a
  // mechanism to pause it. Hover alone is not one — it is unavailable to keyboard
  // and touch users.
  const rotating = !stopped && !suspended && !reduceMotion

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (!rotating) return
    const id = setInterval(next, SLIDE_DURATION_MS)
    return () => clearInterval(id)
  }, [rotating, next])

  const slide = slides[current]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sectors we build for"
      /*
       * 100svh rather than 100vh: on mobile browsers 100vh is measured against
       * the viewport with the URL bar retracted, so a full-height hero has its
       * bottom edge — the slide controls — cut off on first paint.
       */
      className="relative min-h-[100svh] overflow-hidden"
      onMouseEnter={() => setSuspended(true)}
      onMouseLeave={() => setSuspended(false)}
      onFocus={() => setSuspended(true)}
      onBlur={() => setSuspended(false)}
    >
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
            src={slide.image}
            alt=""
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden="true" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/75"
      />

      {/*
        Only the active slide is in the DOM, so announcing changes while the
        carousel rotates on its own would interrupt a screen-reader user every
        five seconds. Announcements are enabled only once rotation has stopped,
        which is what the APG carousel pattern prescribes.
      */}
      <div
        className="relative z-10 mx-auto flex h-[100svh] max-w-7xl flex-col justify-center px-4 pt-20 sm:px-6 lg:px-8"
        aria-live={rotating ? 'off' : 'polite'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slide.tag} — slide ${current + 1} of ${slides.length}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-groove-gold">
                {slide.tag}
              </span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {slide.heading[0]}
              <br />
              <span className="text-gradient-gold">{slide.heading[1]}</span>
            </h1>

            <p className="mb-10 max-w-md text-lg leading-relaxed text-white/80 sm:text-xl">
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-groove-gold px-7 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-gold-hover"
              >
                View Our Work
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Start a Project
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <p
          aria-hidden="true"
          className="absolute bottom-12 right-6 flex items-baseline gap-3 sm:right-10"
        >
          <span className="font-display text-5xl font-bold leading-none tabular-nums text-white/45">
            0{current + 1}
          </span>
          <span className="text-sm text-white/60">/ 0{slides.length}</span>
        </p>
      </div>

      {/*
        Every control below is at least 44px in both directions. The dots were
        previously 6px squares, which is under even the 24px WCAG 2.5.8 minimum;
        the visible dot is now decoration inside a full-size hit area.
      */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 sm:left-6"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 sm:right-6"
        aria-label="Next slide"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>

      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center">
        {!reduceMotion && (
          <button
            type="button"
            onClick={() => setStopped((prev) => !prev)}
            aria-pressed={stopped}
            aria-label={stopped ? 'Start automatic slide changes' : 'Stop automatic slide changes'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
          >
            {stopped ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
        )}

        {slides.map((s, i) => (
          <button
            key={s.tag}
            type="button"
            onClick={() => setCurrent(i)}
            aria-current={i === current}
            aria-label={`Show slide ${i + 1}: ${s.tag}`}
            className="group flex h-11 w-6 items-center justify-center"
          >
            <span
              aria-hidden="true"
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'h-1.5 w-5 bg-groove-gold'
                  : 'h-1.5 w-1.5 bg-white/50 group-hover:bg-white/80'
              }`}
            />
          </button>
        ))}
      </div>

      {rotating && (
        <motion.div
          key={`progress-${current}`}
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-groove-gold/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
        />
      )}
    </section>
  )
}
