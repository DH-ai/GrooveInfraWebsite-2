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

async function listStorageFiles(slug: string): Promise<string[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage.from(PROJECTS_BUCKET).list(slug, { limit: 1000 })
  if (error || !data) return []
  return data.filter((entry) => entry.name).map((entry) => `${slug}/${entry.name}`)
}

async function removeStoragePaths(paths: string[]) {
  if (paths.length === 0) return
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(PROJECTS_BUCKET).remove(paths)
  if (error) console.error('[admin/projects] storage remove failed:', error.message)
}

async function removeCoverInStorage(slug: string) {
  const files = await listStorageFiles(slug)
  const covers = files.filter((p) => path.basename(p).startsWith('cover'))
  await removeStoragePaths(covers)
}

async function removeGalleryInStorage(slug: string) {
  const files = await listStorageFiles(slug)
  const gallery = files.filter((p) => !path.basename(p).startsWith('cover'))
  await removeStoragePaths(gallery)
}

async function deleteProjectEverywhere(slug: string) {
  const supabase = getSupabaseAdmin()
  const files = await listStorageFiles(slug)
  await removeStoragePaths(files)
  const { error } = await supabase.from('projects').delete().eq('slug', slug)
  if (error) throw new Error(`Delete failed: ${error.message}`)
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
      await deleteProjectEverywhere(slug)
      return NextResponse.redirect(new URL(`/admin?deleted=1&slug=${slug}`, request.url))
    } catch (err) {
      console.error('[admin/projects] delete failed:', err)
      return NextResponse.redirect(new URL('/admin?error=delete-failed', request.url))
    }
  }

  const supabase = getSupabaseAdmin()
  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError || !existing) {
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

  const galleryEntries = formData.getAll('gallery')
  const galleryFiles = galleryEntries.filter((entry) => isFile(entry) && entry.size > 0) as File[]

  if (replaceGallery && galleryFiles.length === 0) {
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
  }

  try {
    let coverImage: string | undefined = (existing.cover_image as string | null) ?? undefined

    if (removeCover) {
      coverImage = undefined
      await removeCoverInStorage(slug)
    }

    const coverFileEntry = formData.get('cover_image_file')
    if (isFile(coverFileEntry) && coverFileEntry.size > 0) {
      const ext = getFileExtension(coverFileEntry)
      if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
      }
      await removeCoverInStorage(slug)
      coverImage = await uploadToStorage(
        coverFileEntry,
        `${slug}/cover${ext}`,
        coverFileEntry.type || 'image/jpeg'
      )
    } else if (coverImageUrl) {
      coverImage = coverImageUrl
    }

    let images = ((existing.images as string[] | null) ?? []).slice()
    if (replaceGallery) {
      await removeGalleryInStorage(slug)
      images = []
    }

    let index = images.length + 1
    for (const file of galleryFiles) {
      const ext = getFileExtension(file)
      if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=invalid`, request.url))
      }
      const fileName = `image-${String(index).padStart(2, '0')}${ext}`
      const url = await uploadToStorage(file, `${slug}/${fileName}`, file.type || 'image/jpeg')
      images.push(url)
      index += 1
    }

    const updated: Record<string, unknown> = {
      title,
      category,
      location,
      client_name: clientName,
      basic_description: basicDescription,
      description,
      duration,
      images,
      year: year ?? null,
      area: area || null,
      cover_image: coverImage ?? null,
    }

    const { error: updateError } = await supabase.from('projects').update(updated).eq('slug', slug)
    if (updateError) {
      console.error('[admin/projects] update failed:', updateError.message)
      return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=update-failed`, request.url))
    }

    return NextResponse.redirect(new URL(`/admin/projects/${slug}?success=1`, request.url))
  } catch (err) {
    console.error('[admin/projects] update failed:', err)
    return NextResponse.redirect(new URL(`/admin/projects/${slug}?error=update-failed`, request.url))
  }
}
