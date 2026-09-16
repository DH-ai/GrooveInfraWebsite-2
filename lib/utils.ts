import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCategory(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

/**
 * The second half of a credit line, dropped when it only repeats the first.
 *
 * A fit-out is usually titled after whoever commissioned it, so a project called
 * "Aurum & Co" has "Aurum & Co" as its client too. Anywhere the two are printed
 * side by side the line repeats itself, which reads like a data-entry mistake
 * rather than a credit.
 */
export function distinctCredit(primary: string, secondary: string): string | null {
  return secondary.trim() === primary.trim() ? null : secondary
}
