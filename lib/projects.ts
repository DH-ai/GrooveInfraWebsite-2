import fs from 'fs'
import path from 'path'
import type { Project, ProjectMetadata, Testimonial } from '@/types/project'
import { hasRealCoverImage } from '@/lib/utils'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'projects')

function getLocalImages(slug: string): string[] {
  const dir = path.join(PUBLIC_IMAGES_DIR, slug)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
    .sort()
    .map((f) => `/images/projects/${slug}/${f}`)
}

function getLocalLogo(slug: string): string | undefined {
  const dir = path.join(PUBLIC_IMAGES_DIR, slug, 'logo')
  if (!fs.existsSync(dir)) return undefined
  const file = fs.readdirSync(dir).find((f) => /\.(jpg|jpeg|png|webp|svg)$/i.test(f))
  return file ? `/images/projects/${slug}/logo/${file}` : undefined
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((dir) => {
      const metaPath = path.join(CONTENT_DIR, dir.name, 'metadata.json')
      if (!fs.existsSync(metaPath)) return null

      const metadata: ProjectMetadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      const localImages = getLocalImages(dir.name)
      const images = localImages

      return {
        ...metadata,
        images,
        logo: getLocalLogo(dir.name),
      }
    })
    .filter(Boolean) as Project[]
}

export function getProjectBySlug(slug: string): Project | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null
}

export function getFeaturedProjects(): Project[] {
  const all = getAllProjects()
  const featured = all.filter((p) => p.featured)
  return featured.length ? featured : all.slice(0, 6)
}

export function getProjectsForCarousel(): Project[] {
  return getAllProjects().filter((p) => p.images.length > 0 && hasRealCoverImage(p))
}

export function getAllImages(): string[] {
  return getAllProjects().flatMap((p) => p.images)
}

export function getAllTestimonials(): Testimonial[] {
  return getAllProjects()

    .filter((p) => p.testimonial).map((p) => ({
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

export function getProjectsByCategory(category: string): Project[] {
  return getAllProjects().filter((p) => p.category === category)
}
