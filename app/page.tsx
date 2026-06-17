import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Services from '@/components/home/Services'
import PhotoCarousel from '@/components/home/PhotoCarousel'
import Testimonials from '@/components/home/Testimonials'
import CallToAction from '@/components/home/CallToAction'
import { getProjectsForCarousel, getAllTestimonials } from '@/lib/projects'

export const revalidate = 0

export default async function HomePage() {
  const [projects, testimonials] = await Promise.all([
    getProjectsForCarousel(),
    getAllTestimonials(),
  ])

  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <PhotoCarousel projects={projects} />
      <Testimonials testimonials={testimonials} />
      <CallToAction />
    </>
  )
}
