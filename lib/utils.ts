import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCategory(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

const PLACEHOLDER_HOSTS = ['picsum.photos', 'images.unsplash.com', 'plus.unsplash.com']

export function isPlaceholderImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export function getCoverImage(project: { cover_image?: string; images: string[] }): string | null {
  const candidates = [project.cover_image, ...project.images].filter(Boolean) as string[]
  for (const src of candidates) {
    if (!isPlaceholderImageUrl(src)) return src
  }
  return null
}

export function hasRealCoverImage(project: { cover_image?: string; images: string[] }): boolean {
  return getCoverImage(project) !== null
}
