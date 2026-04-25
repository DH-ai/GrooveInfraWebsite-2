'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types/project'
import { formatCategory, getCoverImage } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cover = getCoverImage(project)

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Link href={`/projects/${project.slug}`} className="block group">
        <div className="rounded-2xl overflow-hidden bg-surface-2 border border-subtle hover:border-groove-gold/20 transition-all duration-300 hover:shadow-glass">
          {/* Image container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Image
                src={cover}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Category */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/90 border border-white/10">
                {formatCategory(project.category)}
              </span>
            </div>

            {/* Arrow button */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          </div>

          {/* Card body */}
          <div className="p-5">
            <h3 className="font-display font-semibold text-primary text-lg mb-1 group-hover:text-accent-gold transition-colors duration-300 line-clamp-1">
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 text-secondary text-xs mb-3">
              <MapPin size={10} />
              <span>{project.location}</span>
              {project.year && (
                <>
                  <span className="text-muted-custom">·</span>
                  <span>{project.year}</span>
                </>
              )}
            </div>
            {project.description && (
              <p className="text-secondary text-sm leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
            {project.area && (
              <div className="mt-3 pt-3 border-t border-subtle flex items-center justify-between">
                <span className="text-xs text-muted-custom">{project.area}</span>
                {project.duration && (
                  <span className="text-xs text-muted-custom">{project.duration}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
