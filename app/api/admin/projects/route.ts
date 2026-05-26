import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import path from 'path'
import { getSupabaseAdmin, PROJECTS_BUCKET } from '@/lib/supabase'

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

async function uploadToStorage(file: File, storagePath: string, contentType: string) {
  const supabase = getSupabaseAdmin()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  const { data } = supabase.storage.from(PROJECTS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
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

  const supabase = getSupabaseAdmin()

  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    console.error('[admin/projects] existence check failed:', existingError.message)
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  if (existing) {
    return NextResponse.redirect(new URL('/admin?error=slug-exists', request.url))
  }

  const galleryEntries = formData.getAll('gallery')
  const galleryFiles = galleryEntries.filter((entry) => isFile(entry) && entry.size > 0) as File[]

  if (galleryFiles.length === 0) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  try {
    let coverImage: string | undefined
    const coverFileEntry = formData.get('cover_image_file')
    if (isFile(coverFileEntry) && coverFileEntry.size > 0) {
      const ext = getFileExtension(coverFileEntry)
      if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
      }
      coverImage = await uploadToStorage(
        coverFileEntry,
        `${slug}/cover${ext}`,
        coverFileEntry.type || 'image/jpeg'
      )
    } else if (coverImageUrl) {
      coverImage = coverImageUrl
    }

    const imageUrls: string[] = []
    let index = 1
    for (const file of galleryFiles) {
      const ext = getFileExtension(file)
      if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
      }
      const fileName = `image-${String(index).padStart(2, '0')}${ext}`
      const url = await uploadToStorage(file, `${slug}/${fileName}`, file.type || 'image/jpeg')
      imageUrls.push(url)
      index += 1
    }

    const row: Record<string, unknown> = {
      title,
      slug,
      category,
      location,
      client_name: clientName,
      basic_description: basicDescription,
      description,
      duration,
      images: imageUrls,
    }

    if (year !== undefined) row.year = year
    if (area) row.area = area
    if (coverImage) row.cover_image = coverImage

    const { error: insertError } = await supabase.from('projects').insert(row)
    if (insertError) {
      console.error('[admin/projects] insert failed:', insertError.message)
      return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
    }

    return NextResponse.redirect(new URL(`/admin?success=1&slug=${slug}`, request.url))
  } catch (err) {
    console.error('[admin/projects] create failed:', err)
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }
}
