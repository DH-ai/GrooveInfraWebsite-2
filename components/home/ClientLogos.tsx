'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

type ClientMarkConfig = { name: string; logoSrc?: string }

/**
 * Trusted-by row: shows `name` until you add assets under `public/` and set `logoSrc`
 * (e.g. `/images/clients/zara.svg`). Use monochrome or full-colour SVG/PNG; keep wide logos readable at ~110×36px.
 */
const clients: ClientMarkConfig[] = [
  { name: 'Zara' },
  { name: 'Nykaa' },
  { name: 'Wow Momo' },
  { name: "Byju's" },
  { name: 'Decathlon' },
  { name: 'Lenskart' },
  { name: 'Bata' },
  { name: 'Croma' },
  { name: 'Malabar Gold' },
  { name: 'Kalyan Jewellers' },
]

function ClientMark({ name, logoSrc }: ClientMarkConfig) {
  return (
    <motion.div
      className="silver-logo flex items-center justify-center h-14 min-w-[7rem] px-5 rounded-lg border border-subtle bg-surface cursor-default"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      title={name}
    >
      {logoSrc ? (
        <div className="relative h-9 w-[110px]">
          <Image
            src={logoSrc}
            alt={name}
            fill
            className="object-contain object-center"
            sizes="110px"
          />
        </div>
      ) : (
        <span className="font-display font-semibold text-base tracking-wide text-secondary whitespace-nowrap">
          {name}
        </span>
      )}
    </motion.div>
  )
}

export default function ClientLogos() {
  return (
    <section className="py-24 bg-surface border-y border-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-custom">
            Trusted By
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary mt-2">
            India&apos;s Leading Brands
          </h2>
        </AnimatedSection>

        {/* Marquee row 1 */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-surface to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-surface to-transparent pointer-events-none" />

          <motion.div
            className="flex gap-4 mb-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...clients, ...clients].map((client, i) => (
              <ClientMark key={`${client.name}-${i}`} {...client} />
            ))}
          </motion.div>

          <motion.div
            className="flex gap-4"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            {[...clients.slice(5), ...clients.slice(0, 5), ...clients.slice(5), ...clients.slice(0, 5)].map(
              (client, i) => (
                <ClientMark key={`row2-${client.name}-${i}`} {...client} />
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
