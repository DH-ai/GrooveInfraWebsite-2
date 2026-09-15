import { z } from 'zod'
import { CATEGORY_OPTIONS } from '@/lib/upload-constants'

/**
 * Server-side request schemas. Every route previously hand-rolled
 * `String(x ?? '').trim()` coercion with only truthiness checks, so an invalid
 * email reached the mail provider and text fields had no length ceiling.
 */

/** Trims, then treats the empty string as "absent" for optional fields. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional()

const requiredText = (max: number, field: string) =>
  z.string({ message: `${field} is required` }).trim().min(1, `${field} is required`).max(max)

export const CONTACT_MESSAGE_MAX = 5000

export const contactSchema = z.object({
  name: requiredText(120, 'Name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  phone: optionalText(40),
  company: optionalText(160),
  projectType: optionalText(60),
  location: optionalText(120),
  message: requiredText(CONTACT_MESSAGE_MAX, 'Message'),

  // Anti-spam fields. `botField` is a hidden input that real users never see, so
  // any value at all means an automated submission. `renderedAt` is when the form
  // was served, used to reject submissions that arrive implausibly fast.
  botField: z.string().max(200).optional(),
  renderedAt: z.coerce.number().int().nonnegative().optional(),
  turnstileToken: z.string().max(4096).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

const categorySchema = z.enum(Array.from(CATEGORY_OPTIONS) as [string, ...string[]])

const yearSchema = z.coerce
  .number()
  .int()
  .min(1900, 'Year looks too early')
  .max(new Date().getFullYear() + 10, 'Year looks too far in the future')

/** Guards against an unbounded array being written into the images column. */
export const MAX_GALLERY_IMAGES = 60

const imageUrlSchema = z.string().trim().url().max(2048)

export const createProjectSchema = z.object({
  title: requiredText(200, 'Title'),
  slug: optionalText(200),
  category: categorySchema.optional(),
  location: optionalText(160),
  client_name: optionalText(160),
  basic_description: optionalText(400),
  description: optionalText(20000),
  duration: optionalText(80),
  area: optionalText(80),
  year: yearSchema.optional(),
  cover_image: imageUrlSchema.nullish(),
  /*
   * Optional, where it previously demanded at least one image. The client is
   * publishing projects before their photography is ready, and blocking creation
   * on an upload forced the old workaround: paste a stock URL in to get past the
   * form. Projects with no images now render generated plates via
   * lib/project-images.ts, and uploading later supersedes them.
   */
  images: z.array(imageUrlSchema).max(MAX_GALLERY_IMAGES).default([]),
})

export const updateProjectSchema = z.object({
  title: requiredText(200, 'Title'),
  category: categorySchema,
  location: requiredText(160, 'Location'),
  client_name: requiredText(160, 'Client name'),
  basic_description: requiredText(400, 'Short description'),
  description: requiredText(20000, 'Description'),
  duration: requiredText(80, 'Duration'),
  area: optionalText(80),
  year: yearSchema.nullish(),
  cover_image: imageUrlSchema.nullish(),
  images: z.array(imageUrlSchema).max(MAX_GALLERY_IMAGES).optional(),
  remove_cover: z.boolean().optional(),
  replace_gallery: z.boolean().optional(),
})

export const signUploadSchema = z.object({
  paths: z.array(z.string().trim().min(1).max(512)).min(1, 'At least one path is required').max(MAX_GALLERY_IMAGES),
})

/** First validation message, for surfacing a single useful hint to the client. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request'
}
