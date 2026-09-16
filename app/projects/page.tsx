import type { Metadata } from 'next'
import AnimatedSection from '@/components/ui/AnimatedSection'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { getAllProjects, getProjectCategories } from '@/lib/projects'
import { toProjectCardData } from '@/types/project'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Browse our portfolio of premium interior construction projects — retail, commercial, residential, and civil across India.',
  alternates: { canonical: '/projects' },
}

export const revalidate = 300

export default async function ProjectsPage() {
  const projects = await getAllProjects()
  const categories = getProjectCategories()

  return (
    <div className="gutter min-h-screen bg-base pb-28 pt-36">
      <div className="mx-auto w-full max-w-[100rem]">
        <AnimatedSection>
          <p className="text-micro uppercase tracking-eyebrow text-accent-gold">Portfolio</p>
          <h1 className="mt-8 max-w-[20ch] font-display text-h1 font-semibold text-primary">
            Every job, and the date it opened.
          </h1>
          <p className="measure mt-8 text-body-lg text-secondary">
            <span className="nums-tabular">{projects.length}</span> projects across India. Filter by
            sector, or read them in the order they were handed over.
          </p>
        </AnimatedSection>

        {/*
          Projected down to card fields before crossing into the client
          component, so the raw storage URLs and full descriptions stay on the
          server.
        */}
        <div className="mt-20">
          <ProjectGrid projects={projects.map(toProjectCardData)} categories={categories} />
        </div>
      </div>
    </div>
  )
}
