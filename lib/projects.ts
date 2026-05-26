import type { Project, ProjectCategory, Testimonial } from '@/types/project'
import { hasRealCoverImage } from '@/lib/utils'
import { getSupabaseRead } from '@/lib/supabase'

interface ProjectRow {
  title: string
  slug: string
  category: ProjectCategory
  location: string
  client_name: string
  testimonial: string | null
  basic_description: string | null
  description: string
  year: number | null
  area: string | null
  duration: string | null
  featured: boolean | null
  highlight: string | null
  tags: string[] | null
  cover_image: string | null
  images: string[] | null
  logo: string | null
  created_at?: string
}

function rowToProject(row: ProjectRow): Project {
  return {
    title: row.title,
    slug: row.slug,
    category: row.category,
    location: row.location,
    client_name: row.client_name,
    testimonial: row.testimonial ?? undefined,
    basic_description: row.basic_description ?? undefined,
    description: row.description,
    year: row.year ?? undefined,
    area: row.area ?? undefined,
    duration: row.duration ?? undefined,
    featured: row.featured ?? undefined,
    highlight: row.highlight ?? undefined,
    tags: row.tags ?? undefined,
    cover_image: row.cover_image ?? undefined,
    images: row.images ?? [],
    logo: row.logo ?? undefined,
  }
}

export async function getAllProjects(): Promise<Project[]> {
  let supabase
  try {
    supabase = getSupabaseRead()
  } catch (err) {
    console.error('[projects] Supabase not configured:', (err as Error).message)
    return []
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects] getAllProjects error:', error.message)
    return []
  }

  return (data as ProjectRow[]).map(rowToProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  let supabase
  try {
    supabase = getSupabaseRead()
  } catch (err) {
    console.error('[projects] Supabase not configured:', (err as Error).message)
    return null
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[projects] getProjectBySlug error:', error.message)
    return null
  }

  return data ? rowToProject(data as ProjectRow) : null
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getAllProjects()
  const featured = all.filter((p) => p.featured)
  return featured.length ? featured : all.slice(0, 6)
}

export async function getProjectsForCarousel(): Promise<Project[]> {
  const all = await getAllProjects()
  return all.filter((p) => p.images.length > 0 && hasRealCoverImage(p))
}

export async function getAllImages(): Promise<string[]> {
  const all = await getAllProjects()
  return all.flatMap((p) => p.images)
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const all = await getAllProjects()
  return all
    .filter((p) => p.testimonial)
    .map((p) => ({
      text: p.testimonial ?? '',
      client: p.client_name,
      project: p.title,
      slug: p.slug,
      category: p.category,
    }))
}

export function getProjectCategories(): string[] {
  return ['all', 'commercial', 'retail', 'residential', 'civil']
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const all = await getAllProjects()
  return all.filter((p) => p.category === category)
}
