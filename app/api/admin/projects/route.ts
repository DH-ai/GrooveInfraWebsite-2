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

async function writeFileFromUpload(file: File, targetPath: string) {
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(targetPath, buffer)
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.redirect(new URL('/admin/login?error=missing-config', request.url))
  }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const formData = await request.formData()

  const title = String(formData.get('title') ?? '').trim()
  const slugInput = String(formData.get('slug') ?? '').trim()
  const slug = sanitizeSlug(slugInput || title)
  const category = String(formData.get('category') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const clientName = String(formData.get('client_name') ?? '').trim()
  const basicDescription = String(formData.get('basic_description') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration = String(formData.get('duration') ?? '').trim()
  const area = String(formData.get('area') ?? '').trim()
  const yearRaw = String(formData.get('year') ?? '').trim()
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim()

  if (!title || !slug || !category || !location || !clientName || !basicDescription || !description || !duration) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  if (!CATEGORY_OPTIONS.has(category)) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  let year: number | undefined
  if (yearRaw) {
    const parsed = Number(yearRaw)
    if (!Number.isFinite(parsed)) {
      return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
    }
    year = parsed
  }

  const contentDir = path.join(CONTENT_DIR, slug)
  try {
    await fs.access(contentDir)
    return NextResponse.redirect(new URL('/admin?error=slug-exists', request.url))
  } catch {
    // Directory does not exist yet.
  }

  await fs.mkdir(contentDir, { recursive: true })
  const imagesDir = path.join(PUBLIC_IMAGES_DIR, slug)
  await fs.mkdir(imagesDir, { recursive: true })

  const coverFileEntry = formData.get('cover_image_file')
  let coverImage: string | undefined
  if (isFile(coverFileEntry) && coverFileEntry.size > 0) {
    const ext = getFileExtension(coverFileEntry)
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
    }
    const fileName = `cover${ext}`
    await writeFileFromUpload(coverFileEntry, path.join(imagesDir, fileName))
    coverImage = `/images/projects/${slug}/${fileName}`
  } else if (coverImageUrl) {
    coverImage = coverImageUrl
  }

  const galleryEntries = formData.getAll('gallery')
  const galleryFiles = galleryEntries.filter((entry) => isFile(entry) && entry.size > 0) as File[]

  if (galleryFiles.length === 0) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  let index = 1
  for (const file of galleryFiles) {
    const ext = getFileExtension(file)
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
    }
    const fileName = `image-${String(index).padStart(2, '0')}${ext}`
    await writeFileFromUpload(file, path.join(imagesDir, fileName))
    index += 1
  }

  const metadata: Record<string, unknown> = {
    title,
    slug,
    category,
    location,
    client_name: clientName,
    basic_description: basicDescription,
    description,
    duration,
  }

  if (year !== undefined) metadata.year = year
  if (area) metadata.area = area
  if (coverImage) metadata.cover_image = coverImage

  await fs.writeFile(path.join(contentDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

  return NextResponse.redirect(new URL(`/admin?success=1&slug=${slug}`, request.url))
}
