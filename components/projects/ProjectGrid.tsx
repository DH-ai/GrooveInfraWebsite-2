'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from './ProjectCard'
import ProjectFilter from './ProjectFilter'
import type { Project } from '@/types/project'

interface ProjectGridProps {
  projects: Project[]
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

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
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
          className="text-center py-20 text-secondary"
        >
          <p className="text-lg font-display">No projects in this category yet.</p>
          <p className="text-sm mt-2 text-muted-custom">Check back soon.</p>
        </motion.div>
      )}
    </div>
  )
}
