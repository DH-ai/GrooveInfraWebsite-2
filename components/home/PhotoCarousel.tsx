'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

export type CarouselItem = { src: string; href: string; title: string; category: string }

interface PhotoCarouselProps {
  /**
   * Built on the server rather than derived from whole projects here: this is a
   * client component, so anything it receives is serialised into the page, and
   * a strip of a dozen thumbnails does not need the descriptions or the raw
   * storage URLs of every project to render.
   */
  items: CarouselItem[]
}

function CarouselRow({
  items,
  direction,
  speed,
  running,
}: {
  items: CarouselItem[]
  direction: 'left' | 'right'
  speed: number
  running: boolean
}) {
  const xStart = direction === 'left' ? '0%' : '-50%'
  const xEnd = direction === 'left' ? '-50%' : '0%'

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-4 w-max"
        animate={running ? { x: [xStart, xEnd] } : { x: xStart }}
        transition={running ? { duration: speed, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
      >
        {/*
          The track is the item list twice over so it can loop seamlessly. Only
          the first copy is real content: the clone is hidden from assistive tech
          and removed from the tab order, otherwise every project in the strip is
          announced and tabbed through twice.
        */}
        {[items, items].map((copy, copyIndex) =>
          copy.map((item) => (
            <Link
              key={`${copyIndex}-${item.href}`}
              href={item.href}
              tabIndex={copyIndex === 0 ? undefined : -1}
              aria-hidden={copyIndex === 0 ? undefined : true}
              className="group relative flex-shrink-0 w-72 h-52 sm:w-80 sm:h-60 rounded-xl overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 block"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </motion.span>
              <span className="absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition-colors duration-300 group-hover:bg-black/50 group-hover:opacity-100 group-focus-visible:bg-black/50 group-focus-visible:opacity-100">
                <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/80">
                  {item.category}
                </span>
                <span className="font-display text-base font-semibold leading-tight text-white">
                  {item.title}
                </span>
              </span>
            </Link>
          ))
        )}
      </motion.div>
    </div>
  )
}

export default function PhotoCarousel({ items }: PhotoCarouselProps) {
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  // WCAG 2.2.2 requires a way to stop any motion that starts on its own and runs
  // for more than five seconds; this strip runs indefinitely. Reduced-motion
  // users get it stopped without having to ask.
  const running = !paused && !reduceMotion

  if (!items.length) return null

  const row1 = items
  const row2 = [...items.slice(Math.floor(items.length / 2)), ...items.slice(0, Math.floor(items.length / 2))]

  return (
    <section className="py-20 overflow-hidden bg-surface border-y border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Our Work
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary">
              Spaces We&apos;ve Crafted
            </h2>
          </div>
          <div className="max-w-xs sm:pb-1">
            <p className="text-secondary text-sm">
              Select any image to explore the full project gallery and client story.
            </p>
            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              aria-pressed={paused}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-strong px-4 text-xs font-medium tracking-wide text-secondary transition-colors hover:border-groove-gold/60 hover:text-primary"
            >
              {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              {paused ? 'Resume scrolling' : 'Pause scrolling'}
            </button>
          </div>
        </AnimatedSection>
      </div>

      <div className="mb-4">
        <CarouselRow items={row1} direction="left" speed={38} running={running} />
      </div>

      <CarouselRow items={row2} direction="right" speed={44} running={running} />
    </section>
  )
}
