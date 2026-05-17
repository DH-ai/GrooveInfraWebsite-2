'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Project } from '@/types/project'
import { getCoverImage } from '@/lib/utils'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface PhotoCarouselProps {
  projects: Project[]
}

function CarouselRow({
  items,
  direction,
  speed,
}: {
  items: { src: string; href: string; title: string; category: string }[]
  direction: 'left' | 'right'
  speed: number
}) {
  const doubled = [...items, ...items]
  const xStart = direction === 'left' ? '0%' : '-50%'
  const xEnd = direction === 'left' ? '-50%' : '0%'

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: [xStart, xEnd] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            className="group relative flex-shrink-0 w-72 h-52 sm:w-80 sm:h-60 rounded-xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0"
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
            </motion.div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-400 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
              <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/60 mb-1">
                {item.category}
              </span>
              <span className="text-white font-display text-base font-semibold leading-tight">
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}

export default function PhotoCarousel({ projects }: PhotoCarouselProps) {
  const items = projects
    .map((p) => {
      const src = getCoverImage(p)
      if (!src) return null
      return {
        src,
        href: `/projects/${p.slug}`,
        title: p.title,
        category: p.category,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

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
          <p className="text-secondary text-sm max-w-xs sm:pb-1">
            Click any image to explore the full project gallery and client story.
          </p>
        </AnimatedSection>
      </div>

      {/* Row 1 → left */}
      <div className="mb-4">
        <CarouselRow items={row1} direction="left" speed={38} />
      </div>

      {/* Row 2 → right */}
      <CarouselRow items={row2} direction="right" speed={44} />
    </section>
  )
}
