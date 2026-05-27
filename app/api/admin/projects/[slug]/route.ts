import path from 'path'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin, PROJECTS_BUCKET } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { CATEGORY_OPTIONS, sanitizeSlug } from '@/lib/upload-constants'

interface UpdateProjectBody {
  _action?: string
  title?: string
  category?: string
  location?: string
  client_name?: string
  basic_description?: string
  description?: string
  duration?: string
  area?: string
  year?: string | number | null
  cover_image?: string | null
  images?: string[]
  remove_cover?: boolean
  replace_gallery?: boolean
}

function getPublicUrlPrefix(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${PROJECTS_BUCKET}/`
}

function isAllowedImageUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith(getPublicUrlPrefix())
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

async function removeGalleryInStorage(slug: string, keepUrls: string[]) {
  const prefix = `${getPublicUrlPrefix()}${slug}/`
  const keepNames = new Set(
    keepUrls
      .filter((u) => u.startsWith(prefix))
      .map((u) => u.slice(prefix.length).split('?')[0])
  )
  const files = await listStorageFiles(slug)
  const toRemove = files.filter((p) => {
    const name = path.basename(p)
    if (name.startsWith('cover')) return false
    return !keepNames.has(name)
  })
  await removeStoragePaths(toRemove)
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
  const auth = checkAdminAuth()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  const rawSlug = params.slug ?? ''
  const slug = sanitizeSlug(rawSlug)
  if (!slug || slug !== rawSlug) {
    return NextResponse.json({ error: 'invalid-slug' }, { status: 400 })
  }

  let body: UpdateProjectBody
  try {
    body = (await request.json()) as UpdateProjectBody
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  if (body._action === 'delete') {
    try {
      await deleteProjectEverywhere(slug)
      return NextResponse.json({ ok: true, deleted: slug })
    } catch (err) {
      console.error('[admin/projects] delete failed:', err)
      return NextResponse.json({ error: 'delete-failed' }, { status: 500 })
    }
  }

  const supabase = getSupabaseAdmin()
  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }

  const title = String(body.title ?? '').trim()
  const category = String(body.category ?? '').trim()
  const location = String(body.location ?? '').trim()
  const clientName = String(body.client_name ?? '').trim()
  const basicDescription = String(body.basic_description ?? '').trim()
  const description = String(body.description ?? '').trim()
  const duration = String(body.duration ?? '').trim()
  const area = String(body.area ?? '').trim()
  const yearRaw = body.year == null ? '' : String(body.year).trim()
  const coverImageRaw = body.cover_image == null ? '' : String(body.cover_image).trim()
  const removeCover = Boolean(body.remove_cover)
  const replaceGallery = Boolean(body.replace_gallery)
  const images = Array.isArray(body.images) ? body.images.map((v) => String(v).trim()) : []

  if (!title || !category || !location || !clientName || !basicDescription || !description || !duration) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (!CATEGORY_OPTIONS.has(category)) {
    return NextResponse.json({ error: 'invalid-category' }, { status: 400 })
  }

  let year: number | undefined
  if (yearRaw) {
    const parsed = Number(yearRaw)
    if (!Number.isFinite(parsed)) {
      return NextResponse.json({ error: 'invalid-year' }, { status: 400 })
    }
    year = parsed
  }

  let coverImage: string | null = (existing.cover_image as string | null) ?? null
  if (removeCover) {
    coverImage = null
  }
  if (coverImageRaw) {
    if (!isAllowedImageUrl(coverImageRaw)) {
      return NextResponse.json({ error: 'invalid-cover-url' }, { status: 400 })
    }
    coverImage = coverImageRaw
  }

  let finalImages: string[]
  if (replaceGallery) {
    if (images.length === 0) {
      return NextResponse.json({ error: 'images-required' }, { status: 400 })
    }
    finalImages = images
  } else {
    finalImages = ((existing.images as string[] | null) ?? []).slice().concat(images)
  }

  for (const url of finalImages) {
    if (!isAllowedImageUrl(url)) {
      return NextResponse.json({ error: 'invalid-image-url', url }, { status: 400 })
    }
  }

  try {
    if (removeCover || coverImageRaw) {
      await removeCoverInStorage(slug)
    }
    if (replaceGallery) {
      await removeGalleryInStorage(slug, finalImages)
    }

    const updated: Record<string, unknown> = {
      title,
      category,
      location,
      client_name: clientName,
      basic_description: basicDescription,
      description,
      duration,
      images: finalImages,
      year: year ?? null,
      area: area || null,
      cover_image: coverImage,
    }

    const { error: updateError } = await supabase.from('projects').update(updated).eq('slug', slug)
    if (updateError) {
      console.error('[admin/projects] update failed:', updateError.message)
      return NextResponse.json({ error: 'update-failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, slug })
  } catch (err) {
    console.error('[admin/projects] update failed:', err)
    return NextResponse.json({ error: 'update-failed' }, { status: 500 })
  }
}
