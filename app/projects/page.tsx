import type { Metadata } from 'next'
import AnimatedSection from '@/components/ui/AnimatedSection'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { getAllProjects, getProjectCategories } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Browse our portfolio of premium interior construction projects — retail, commercial, residential, and civil across India.',
}

export default function ProjectsPage() {
  const projects = getAllProjects()
  const categories = getProjectCategories()

  return (
    <div className="pt-24 pb-20 min-h-screen bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-groove-gold" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Our Portfolio
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary leading-tight mb-5">
            Every Project,
            <br />
            A Story
          </h1>
          <p className="text-secondary text-lg max-w-lg">
            {projects.length} projects across India — each one built with precision, purpose, and an
            obsession for quality.
          </p>
        </AnimatedSection>

        {/* Grid with filter */}
        <ProjectGrid projects={projects} categories={categories} />
      </div>
    </div>
  )
}
