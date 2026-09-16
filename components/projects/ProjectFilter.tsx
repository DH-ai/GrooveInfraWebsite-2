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
    <div
      className="flex flex-wrap gap-x-8 gap-y-1 border-t border-strong pt-3"
      role="group"
      aria-label="Filter projects by category"
    >
      {categories.map((cat) => {
        const selected = active === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={selected}
            /*
             * A sliding gold pill behind the active chip was the loudest element
             * on a page whose subject is photographs. The selected state is now
             * carried by weight, colour and a 2px rule under the label — the same
             * device the header uses for the current page.
             */
            className={cn(
              'relative inline-flex min-h-11 items-center px-1 text-meta uppercase tracking-eyebrow transition-colors duration-200',
              selected ? 'text-primary' : 'text-muted-custom hover:text-secondary'
            )}
          >
            {formatCategory(cat)}
            {selected && (
              <motion.span
                layoutId="filter-underline"
                aria-hidden="true"
                className="absolute bottom-2 left-1 right-1 h-[2px] bg-groove-gold"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
