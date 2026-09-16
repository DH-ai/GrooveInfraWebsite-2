'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from './ProjectCard'
import ProjectFilter from './ProjectFilter'
import type { ProjectCardData } from '@/types/project'
import { formatCategory } from '@/lib/utils'

interface ProjectGridProps {
  projects: ProjectCardData[]
  categories: string[]
}

export default function ProjectGrid({ projects, categories }: ProjectGridProps) {
  const [active, setActive] = useState('all')

  const filtered =
    active === 'all' ? projects : projects.filter((p) => p.category === active)

  return (
    <div>
      <div className="mb-10">
        <ProjectFilter categories={categories} active={active} onChange={setActive} />
      </div>

      {/*
        Choosing a filter silently replaces the grid, which a screen-reader user
        has no way of noticing. This announces the new result count instead.
      */}
      <p aria-live="polite" className="sr-only">
        {filtered.length === 1 ? '1 project' : `${filtered.length} projects`} shown
        {active === 'all' ? '' : ` in ${formatCategory(active)}`}.
      </p>

      {/* Generous gutters: the cards have no borders now, so the space between
          them is what separates one project from the next. */}
      <motion.div layout className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.05, 0.25),
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-subtle py-24"
        >
          <p className="font-display text-h3 font-semibold text-primary">
            Nothing in this sector yet.
          </p>
          <p className="mt-3 text-body text-muted-custom">
            Try another filter, or see everything.
          </p>
        </motion.div>
      )}
    </div>
  )
}
