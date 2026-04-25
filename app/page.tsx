import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Services from '@/components/home/Services'
import PhotoCarousel from '@/components/home/PhotoCarousel'
import ClientLogos from '@/components/home/ClientLogos'
import Testimonials from '@/components/home/Testimonials'
import BlogInsights from '@/components/home/BlogInsights'
import CallToAction from '@/components/home/CallToAction'
import { getAllProjects, getAllTestimonials } from '@/lib/projects'

export default function HomePage() {
  const projects = getAllProjects()
  const testimonials = getAllTestimonials()

  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <PhotoCarousel projects={projects} />
      <ClientLogos />
      <Testimonials testimonials={testimonials} />
      <BlogInsights />
      <CallToAction />
    </>
  )
}
