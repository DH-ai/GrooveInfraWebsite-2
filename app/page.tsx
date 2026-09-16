import Hero, { type HeroFeature } from '@/components/home/Hero'
import WorkIndex, { type WorkIndexEntry } from '@/components/home/WorkIndex'
import Stats from '@/components/home/Stats'
import Services from '@/components/home/Services'
import Testimonials from '@/components/home/Testimonials'
import CallToAction from '@/components/home/CallToAction'
import { getPhotographedProjects, getAllTestimonials } from '@/lib/projects'

// Admin mutations flush this page explicitly via revalidateProjectSurfaces; the
// interval is only a safety net for edits made directly in the database.
export const revalidate = 300

export default async function HomePage() {
  const [projects, testimonials] = await Promise.all([
    getPhotographedProjects(),
    getAllTestimonials(),
  ])

  /*
   * `getPhotographedProjects` has already excluded anything without owned
   * photography, so the homepage leads with real work or with nothing. Until the
   * client uploads, the hero falls back to a drawn plate and the index is absent
   * rather than padded.
   */
  const entries: WorkIndexEntry[] = projects.slice(0, MAX_INDEX_ENTRIES).map((project) => ({
    slug: project.slug,
    title: project.title,
    clientName: project.client_name,
    category: project.category,
    location: project.location,
    year: project.year ?? null,
    image: project.imagery.cover,
  }))

  const feature: HeroFeature | null = entries[0] ?? null

  return (
    <>
      <Hero feature={feature} />
      <WorkIndex entries={entries} />
      <Services />
      <Stats />
      <Testimonials testimonials={testimonials} />
      <CallToAction />
    </>
  )
}
