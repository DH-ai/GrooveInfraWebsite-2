import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Project, ProjectCategory, Testimonial } from '@/types/project'
import { resolveProjectImagery } from '@/lib/project-images'
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
  const images = row.images ?? []

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
    images,
    logo: row.logo ?? undefined,
    // Resolved here, at the single point every project passes through, so a new
    // page cannot accidentally read `images` raw and render a broken frame.
    imagery: resolveProjectImagery({
      slug: row.slug,
      cover_image: row.cover_image ?? undefined,
      images,
    }),
  }
}

/** Returns null (rather than throwing) so a misconfigured env degrades to an empty page. */
function readClient(context: string): SupabaseClient | null {
  try {
    return getSupabaseRead()
  } catch (err) {
    console.error(`[projects] ${context}: Supabase not configured:`, (err as Error).message)
    return null
  }
}

/**
 * Wrapped in React `cache` so the several helpers below share one query per
 * request instead of each issuing its own full-table read.
 */
export const getAllProjects = cache(async (): Promise<Project[]> => {
  const supabase = readClient('getAllProjects')
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects] getAllProjects error:', error.message)
    return []
  }

  return (data as ProjectRow[]).map(rowToProject)
})

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const supabase = readClient('getProjectBySlug')
  if (!supabase) return null

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
})

/**
 * Featured projects, filtered in the database. Falls back to the most recent
 * projects so the homepage is never empty before anything has been flagged.
 */
export const getFeaturedProjects = cache(async (limit = 6): Promise<Project[]> => {
  const supabase = readClient('getFeaturedProjects')
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[projects] getFeaturedProjects error:', error.message)
    return []
  }

  const featured = (data as ProjectRow[]).map(rowToProject)
  if (featured.length > 0) return featured

  return (await getAllProjects()).slice(0, limit)
})

export const getProjectsByCategory = cache(async (category: string): Promise<Project[]> => {
  if (category === 'all') return getAllProjects()

  const supabase = readClient('getProjectsByCategory')
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects] getProjectsByCategory error:', error.message)
    return []
  }

  return (data as ProjectRow[]).map(rowToProject)
})

/**
 * Only projects with owned photography. The homepage carousel is the site's
 * loudest claim about the work, so a drawn placeholder has no business in it —
 * better a shorter carousel than one padded with invented plates. "Owned" is not
 * expressible as a database predicate, hence the filter in application code.
 */
export async function getProjectsForCarousel(): Promise<Project[]> {
  const all = await getAllProjects()
  return all.filter((p) => p.imagery.hasOwnPhotography)
}

/** Owned photography only, for the same reason as the carousel. */
export async function getAllImages(): Promise<string[]> {
  const all = await getAllProjects()
  return all.flatMap((p) => p.imagery.gallery.flatMap((img) => (img.src ? [img.src] : [])))
}

export const getAllTestimonials = cache(async (): Promise<Testimonial[]> => {
  const supabase = readClient('getAllTestimonials')
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .not('testimonial', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects] getAllTestimonials error:', error.message)
    return []
  }

  return (data as ProjectRow[])
    .map(rowToProject)
    .filter((p) => p.testimonial && p.testimonial.trim().length > 0)
    .map((p) => ({
      text: p.testimonial ?? '',
      client: p.client_name,
      project: p.title,
      slug: p.slug,
      category: p.category,
    }))
})

export function getProjectCategories(): string[] {
  return ['all', 'commercial', 'retail', 'residential', 'civil']
}

export interface ProjectSitemapEntry {
  slug: string
  updatedAt: string | null
}

/**
 * Slugs and timestamps only. The sitemap needs neither the descriptions nor the
 * image arrays, and `created_at` is dropped by `rowToProject`, so this selects
 * the two columns it actually uses rather than reusing the full-row query.
 */
export const getProjectSitemapEntries = cache(async (): Promise<ProjectSitemapEntry[]> => {
  const supabase = readClient('getProjectSitemapEntries')
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select('slug, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[projects] getProjectSitemapEntries error:', error.message)
    return []
  }

  return (data as Array<{ slug: string; created_at: string | null }>).map((row) => ({
    slug: row.slug,
    updatedAt: row.created_at,
  }))
})
