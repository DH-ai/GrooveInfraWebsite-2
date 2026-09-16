import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCategory(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}
