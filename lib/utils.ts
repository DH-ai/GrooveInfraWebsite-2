import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCategory(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export function getCoverImage(project: { cover_image?: string; images: string[] }): string {
  return project.cover_image ?? project.images[0] ?? 'https://picsum.photos/seed/default/1200/800'
}
