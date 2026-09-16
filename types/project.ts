import type { ProjectImagery } from '@/lib/project-images'

export type ProjectCategory = 'retail' | 'commercial' | 'residential' | 'civil'

export interface ProjectMetadata {
  title: string
  slug: string
  category: ProjectCategory
  location: string
  client_name: string
  testimonial?: string
  basic_description?: string
  description: string
  year?: number
  area?: string
  duration?: string
  featured?: boolean
  highlight?: string
  tags?: string[]
  cover_image?: string
}

export interface Project extends ProjectMetadata {
  images: string[]
  logo?: string
  /**
   * Resolved by the data layer, never by a page. Present on every project so no
   * surface can forget that the client's photography may not be uploaded yet.
   */
  imagery: ProjectImagery
}

/**
 * Exactly what a card renders, and nothing else.
 *
 * `ProjectCard` and `ProjectGrid` are client components, so whatever they are
 * handed is serialised into the RSC payload in the HTML. Passing whole projects
 * shipped the raw storage URLs and the full 20,000-character description down to
 * every visitor for every card, and it put the third-party stock URLs still
 * sitting in legacy rows into the markup of pages that deliberately do not render
 * them.
 */
export interface ProjectCardData {
  title: string
  slug: string
  category: ProjectCategory
  location: string
  year?: number
  area?: string
  duration?: string
  /** Already chosen between the short and the full description. */
  summary: string
  imagery: ProjectImagery
}

export function toProjectCardData(project: Project): ProjectCardData {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    location: project.location,
    year: project.year,
    area: project.area,
    duration: project.duration,
    summary: project.basic_description ?? project.description,
    imagery: project.imagery,
  }
}

export interface Testimonial {
  text: string
  client: string
  project: string
  slug: string
  category: ProjectCategory
}

export interface BlogPost {
  title: string
  slug: string
  date: string
  category: string
  description: string
  cover_image: string
  reading_time: string
}
