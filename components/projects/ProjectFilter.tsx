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
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            active === cat
              ? 'text-black dark:text-black'
              : 'text-secondary hover:text-primary border border-subtle hover:border-groove-gold/40'
          )}
        >
          {active === cat && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-full bg-groove-gold"
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            />
          )}
          <span className="relative z-10">{formatCategory(cat)}</span>
        </button>
      ))}
    </div>
  )
}
