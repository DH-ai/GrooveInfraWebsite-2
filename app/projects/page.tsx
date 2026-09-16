import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
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
    <PageShell>
      <PageHeader
        label="Portfolio"
        title="Every job, and the date it opened."
        intro={
          <>
            <span className="nums-tabular">{projects.length}</span> projects across India. Filter by
            sector, or read them in the order they were handed over.
          </>
        }
      />

      {/*
        Projected down to card fields before crossing into the client component,
        so the raw storage URLs and full descriptions stay on the server.
      */}
      <div className="mt-20">
        <ProjectGrid projects={projects.map(toProjectCardData)} categories={categories} />
      </div>
    </PageShell>
  )
}
