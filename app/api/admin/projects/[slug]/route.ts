import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs/promises'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'projects')
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const CATEGORY_OPTIONS = new Set(['commercial', 'retail', 'residential', 'civil'])

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === 'object' && 'arrayBuffer' in value)
}

function getFileExtension(file: File): string {
  return path.extname(file.name).toLowerCase()
}

function isImageFileName(name: string): boolean {
  return ALLOWED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
}

async function writeFileFromUpload(file: File, targetPath: string) {
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(targetPath, buffer)
}

function requireAdmin(request: Request): NextResponse | null {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.redirect(new URL('/admin/login?error=missing-config', request.url))
  }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return null
}

async function removeCoverFiles(imagesDir: string) {
  try {
    const entries = await fs.readdir(imagesDir, { withFileTypes: true })
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isFile()) return
        if (!isImageFileName(entry.name)) return
        if (!entry.name.startsWith('cover')) return
        await fs.rm(path.join(imagesDir, entry.name))
      })
    )
  } catch {
    // Ignore missing directories.
  }
}

async function removeGalleryFiles(imagesDir: string) {
  try {
    const entries = await fs.readdir(imagesDir, { withFileTypes: true })
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isFile()) return
        if (!isImageFileName(entry.name)) return
        if (entry.name.startsWith('cover')) return
        await fs.rm(path.join(imagesDir, entry.name))
      })
    )
  } catch {
    // Ignore missing directories.
  }
}

async function getNextGalleryIndex(imagesDir: string): Promise<number> {
  try {
    const entries = await fs.readdir(imagesDir, { withFileTypes: true })
    const count = entries.filter(
      (entry) => entry.isFile() && isImageFileName(entry.name) && !entry.name.startsWith('cover')
    ).length
    return count + 1
  } catch {
    return 1
  }
}

async function deleteProject(slug: string) {
  await fs.rm(path.join(CONTENT_DIR, slug), { recursive: true, force: true })
  await fs.rm(path.join(PUBLIC_IMAGES_DIR, slug), { recursive: true, force: true })
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const authResponse = requireAdmin(request)
  if (authResponse) return authResponse

  const rawSlug = params.slug ?? ''
  const slug = sanitizeSlug(rawSlug)
  if (!slug || slug !== rawSlug) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  const formData = await request.formData()
  const action = String(formData.get('_action') ?? '')

  if (action === 'delete') {
    try {
      await deleteProject(slug)
      return NextResponse.redirect(new URL(`/admin?deleted=1&slug=${slug}`, request.url))
    } catch {
      return NextResponse.redirect(new URL('/admin?error=delete-failed', request.url))
    }
  }

  const metadataPath = path.join(CONTENT_DIR, slug, 'metadata.json')
  let existing: Record<string, unknown>
  try {
    existing = JSON.parse(await fs.readFile(metadataPath, 'utf-8')) as Record<string, unknown>
  } catch {
    return NextResponse.redirect(new URL('/admin?error=not-found', request.url))
  }

  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const clientName = String(formData.get('client_name') ?? '').trim()
  const basicDescription = String(formData.get('basic_description') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration = String(formData.get('duration') ?? '').trim()
  const area = String(formData.get('area') ?? '').trim()
  const yearRaw = String(formData.get('year') ?? '').trim()
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()
  const removeCover = String(formData.get('remove_cover') ?? '') === '1'
  const replaceGallery = String(formData.get('replace_gallery') ?? '') === '1'

  if (!title || !category || !location || !clientName || !basicDescription || !description || !duration) {
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
  }

  if (!CATEGORY_OPTIONS.has(category)) {
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
  }

  let year: number | undefined
  if (yearRaw) {
    const parsed = Number(yearRaw)
    if (!Number.isFinite(parsed)) {
      return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
    }
    year = parsed
  }

  const imagesDir = path.join(PUBLIC_IMAGES_DIR, slug)
  await fs.mkdir(imagesDir, { recursive: true })

  let coverImage = existing.cover_image as string | undefined
  if (removeCover) {
    coverImage = undefined
    await removeCoverFiles(imagesDir)
  }

  const coverFileEntry = formData.get('cover_image_file')
  if (isFile(coverFileEntry) && coverFileEntry.size > 0) {
    const ext = getFileExtension(coverFileEntry)
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
    }
    await removeCoverFiles(imagesDir)
    const fileName = `cover${ext}`
    await writeFileFromUpload(coverFileEntry, path.join(imagesDir, fileName))
    coverImage = `/images/projects/${slug}/${fileName}`
  } else if (coverImageUrl) {
    coverImage = coverImageUrl
  }

  const galleryEntries = formData.getAll('gallery')
  const galleryFiles = galleryEntries.filter((entry) => isFile(entry) && entry.size > 0) as File[]

  if (replaceGallery && galleryFiles.length === 0) {
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
  }

  let index = await getNextGalleryIndex(imagesDir)
  if (replaceGallery) {
    await removeGalleryFiles(imagesDir)
    index = 1
  }

  for (const file of galleryFiles) {
    const ext = getFileExtension(file)
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
    }
    const fileName = `image-${String(index).padStart(2, '0')}${ext}`
    await writeFileFromUpload(file, path.join(imagesDir, fileName))
    index += 1
  }

  const updated: Record<string, unknown> = {
    ...existing,
    title,
    slug,
    category,
    location,
    client_name: clientName,
    basic_description: basicDescription,
    description,
    duration,
  }

  if (year !== undefined) updated.year = year
  else delete updated.year

  if (area) updated.area = area
  else delete updated.area

  if (coverImage) updated.cover_image = coverImage
  else delete updated.cover_image

  try {
    await fs.writeFile(metadataPath, JSON.stringify(updated, null, 2))
  } catch {
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=update-failed`, request.url))
  }

  return NextResponse.redirect(new URL(`/admin/projects/${slug}?success=1`, request.url))
}
