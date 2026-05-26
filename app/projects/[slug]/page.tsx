import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Maximize2, Clock, Quote } from 'lucide-react'
import ProjectGallery from '@/components/projects/ProjectGallery'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'
import { formatCategory, getCoverImage } from '@/lib/utils'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const all = await getAllProjects()
  return all.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.basic_description ?? project.description,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  const cover = getCoverImage(project)

  const metaItems = [
    project.location && { icon: MapPin, label: 'Location', value: project.location },
    project.year && { icon: Calendar, label: 'Year', value: String(project.year) },
    project.area && { icon: Maximize2, label: 'Area', value: project.area },
    project.duration && { icon: Clock, label: 'Duration', value: project.duration },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  return (
    <div className="min-h-screen bg-base pt-20">
      {/* Hero image */}
      <div className="relative h-[55vh] sm:h-[65vh] overflow-hidden bg-surface">
        {cover && (
          <Image
            src={cover}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg))] via-black/20 to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block text-[10px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 border border-white/10 mb-4">
              {formatCategory(project.category)}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <AnimatedSection className="mb-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <AnimatedSection>
              <h2 className="font-display text-2xl font-bold text-primary mb-4">About This Project</h2>
              {project.basic_description && (
                <p className="text-primary text-lg font-medium mb-3">
                  {project.basic_description}
                </p>
              )}
              <p className="text-secondary leading-relaxed text-lg">{project.description}</p>
            </AnimatedSection>

            {/* Gallery */}
            {project.images.length > 0 && (
              <AnimatedSection delay={0.1}>
                <h2 className="font-display text-2xl font-bold text-primary mb-6">Gallery</h2>
                <ProjectGallery images={project.images} title={project.title} />
              </AnimatedSection>
            )}

            {/* Testimonial */}
            {project.testimonial && (
              <AnimatedSection delay={0.15}>
                <div className="rounded-2xl bg-surface-2 border border-subtle p-8">
                  <Quote size={24} className="text-accent-gold mb-4" />
                  <blockquote className="font-display text-xl text-primary leading-relaxed mb-4">
                    &ldquo;{project.testimonial}&rdquo;
                  </blockquote>
                  <div>
                    <span className="font-semibold text-primary">{project.client_name}</span>
                    <span className="text-muted-custom text-sm ml-2">· {project.title}</span>
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>

          {/* Sidebar */}
          <AnimatedSection delay={0.1} className="space-y-6">
            {/* Meta */}
            <div className="rounded-2xl bg-surface-2 border border-subtle p-6">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-5">
                Project Details
              </h3>
              <div className="flex flex-col gap-4">
                {metaItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-groove-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-accent-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-custom">{label}</div>
                      <div className="text-sm font-medium text-primary">{value}</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-groove-gold/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-gold text-xs font-bold">C</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-custom">Client</div>
                    <div className="text-sm font-medium text-primary">{project.client_name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="rounded-2xl bg-surface-2 border border-subtle p-6">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-4">
                  Scope
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border border-subtle text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-groove-dark to-groove-black border border-groove-gold/15 p-6 text-center">
              <p className="text-white/70 text-sm mb-4">Liked this project?</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-groove-gold text-black text-sm font-medium hover:shadow-gold transition-all duration-300 hover:scale-105"
              >
                Start Something Similar
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
