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
  placeholder_images?: string[]
  cover_image?: string
}

export interface Project extends ProjectMetadata {
  images: string[]
  logo?: string
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
