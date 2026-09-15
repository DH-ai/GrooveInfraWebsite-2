'use client'

import { motion } from 'framer-motion'
import { cn, formatCategory } from '@/lib/utils'

interface ProjectFilterProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export default function ProjectFilter({ categories, active, onChange }: ProjectFilterProps) {
  return (
    /*
      A toggle-button group rather than a radiogroup: each chip acts on the page
      immediately and independently, and aria-pressed is what conveys "this one
      is currently on". A radiogroup would additionally promise arrow-key
      selection semantics that these chips do not implement.
    */
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
      {categories.map((cat) => {
        const selected = active === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={selected}
            className={cn(
              'relative inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition-colors duration-200',
              selected
                ? 'text-black'
                : 'border border-strong text-secondary hover:border-groove-gold/60 hover:text-primary'
            )}
          >
            {selected && (
              <motion.span
                layoutId="filter-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-groove-gold"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10">{formatCategory(cat)}</span>
          </button>
        )
      })}
    </div>
  )
}
