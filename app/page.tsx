import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Services from '@/components/home/Services'
import PhotoCarousel from '@/components/home/PhotoCarousel'
import Testimonials from '@/components/home/Testimonials'
import CallToAction from '@/components/home/CallToAction'
import { getProjectsForCarousel, getAllTestimonials } from '@/lib/projects'

// Admin mutations flush this page explicitly via revalidateProjectSurfaces; the
// interval is only a safety net for edits made directly in the database.
export const revalidate = 300

export default async function HomePage() {
  const [projects, testimonials] = await Promise.all([
    getProjectsForCarousel(),
    getAllTestimonials(),
  ])

  /*
   * `getProjectsForCarousel` has already excluded anything without owned
   * photography, so every cover has a `src`. The filter keeps the type honest
   * rather than asserting it.
   */
  const carouselItems = projects.flatMap((p) =>
    p.imagery.cover.src
      ? [{ src: p.imagery.cover.src, href: `/projects/${p.slug}`, title: p.title, category: p.category }]
      : []
  )

  return (
    <>
      {/*
        The carousel query already returns only projects with owned photography,
        so the hero fills itself with the client's real work as soon as any is
        uploaded and draws plates until then.
      */}
      <Hero backdrops={projects.map((p) => p.imagery.cover)} />
      <Stats />
      <Services />
      <PhotoCarousel items={carouselItems} />
      <Testimonials testimonials={testimonials} />
      <CallToAction />
    </>
  )
}
