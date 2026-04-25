'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Project } from '@/types/project'
import { formatCategory, getCoverImage } from '@/lib/utils'

interface FeaturedProjectsProps {
  projects: Project[]
}

function ProjectCard({
  project,
  className = '',
  imageClassName = '',
  index,
}: {
  project: Project
  className?: string
  imageClassName?: string
  index: number
}) {
  const cover = getCoverImage(project)

  return (
    <AnimatedSection delay={index * 0.08} className={className}>
      <Link href={`/projects/${project.slug}`} className="block group h-full">
        <div className={`relative overflow-hidden rounded-2xl bg-surface-2 border border-subtle h-full min-h-[240px] ${imageClassName}`}>
          {/* Image */}
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Image
              src={cover}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-groove-gold/5 transition-colors duration-500" />

          {/* Category */}
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 border border-white/10">
              {formatCategory(project.category)}
            </span>
          </div>

          {/* Arrow */}
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-groove-gold flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight size={14} className="text-black" />
          </motion.div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-groove-gold group-hover:border-transparent transition-all duration-300">
            <ArrowRight size={14} className="text-white group-hover:text-black transition-colors" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
              <MapPin size={10} />
              <span>{project.location}</span>
              {project.year && <><span>·</span><span>{project.year}</span></>}
            </div>
            <h3 className="font-display font-semibold text-white text-lg leading-tight group-hover:text-groove-gold-light transition-colors duration-300">
              {project.title}
            </h3>
          </div>
        </div>
      </Link>
    </AnimatedSection>
  )
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects.length) return null
  const display = projects.slice(0, 5)

  return (
    <section className="py-28 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end gap-6 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Featured Work
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
              Spaces We&apos;ve
              <br />
              Transformed
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors self-start sm:self-auto pb-1"
          >
            View all projects
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        {/* Layout: [large] [two stacked] on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Large featured card */}
          {display[0] && (
            <ProjectCard
              project={display[0]}
              className="lg:col-span-2 lg:row-span-2"
              imageClassName="min-h-[340px] lg:min-h-[520px]"
              index={0}
            />
          )}

          {/* Right column: 2 stacked */}
          {display[1] && (
            <ProjectCard
              project={display[1]}
              imageClassName="min-h-[240px]"
              index={1}
            />
          )}
          {display[2] && (
            <ProjectCard
              project={display[2]}
              imageClassName="min-h-[240px]"
              index={2}
            />
          )}

          {/* Bottom row: remaining 2 */}
          {display[3] && (
            <ProjectCard
              project={display[3]}
              imageClassName="min-h-[220px]"
              index={3}
            />
          )}
          {display[4] && (
            <ProjectCard
              project={display[4]}
              imageClassName="min-h-[220px]"
              index={4}
            />
          )}
        </div>
      </div>
    </section>
  )
}
