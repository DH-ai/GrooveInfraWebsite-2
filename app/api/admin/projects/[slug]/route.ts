import path from 'path'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin, PROJECTS_BUCKET } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { revalidateProjectSurfaces } from '@/lib/revalidate'
import { getPublicUrlPrefix, isAllowedImageUrl } from '@/lib/supabase-storage'
import { sanitizeSlug } from '@/lib/upload-constants'
import { firstIssueMessage, updateProjectSchema } from '@/lib/validation'

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
  const auth = await checkAdminAuth()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  const rawSlug = params.slug ?? ''
  const slug = sanitizeSlug(rawSlug)
  if (!slug || slug !== rawSlug) {
    return NextResponse.json({ error: 'invalid-slug' }, { status: 400 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  if ((raw as { _action?: string } | null)?._action === 'delete') {
    try {
      await deleteProjectEverywhere(slug)
      revalidateProjectSurfaces(slug)
      return NextResponse.json({ ok: true, deleted: slug })
    } catch (err) {
      console.error('[admin/projects] delete failed:', err)
      return NextResponse.json({ error: 'delete-failed' }, { status: 500 })
    }
  }

  const parsed = updateProjectSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid', detail: firstIssueMessage(parsed.error) },
      { status: 400 }
    )
  }
  const body = parsed.data

  const supabase = getSupabaseAdmin()
  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }

  const removeCover = body.remove_cover ?? false
  const replaceGallery = body.replace_gallery ?? false
  const images = body.images ?? []

  let coverImage: string | null = (existing.cover_image as string | null) ?? null
  if (removeCover) {
    coverImage = null
  }
  if (body.cover_image) {
    if (!isAllowedImageUrl(body.cover_image)) {
      return NextResponse.json({ error: 'invalid-cover-url' }, { status: 400 })
    }
    coverImage = body.cover_image
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
    if (removeCover || body.cover_image) {
      await removeCoverInStorage(slug)
    }
    if (replaceGallery) {
      await removeGalleryInStorage(slug, finalImages)
    }

    const updated: Record<string, unknown> = {
      title: body.title,
      category: body.category,
      location: body.location,
      client_name: body.client_name,
      basic_description: body.basic_description,
      description: body.description,
      duration: body.duration,
      images: finalImages,
      year: body.year ?? null,
      area: body.area ?? null,
      cover_image: coverImage,
    }

    const { error: updateError } = await supabase.from('projects').update(updated).eq('slug', slug)
    if (updateError) {
      console.error('[admin/projects] update failed:', updateError.message)
      return NextResponse.json({ error: 'update-failed' }, { status: 500 })
    }

    revalidateProjectSurfaces(slug)

    return NextResponse.json({ ok: true, slug })
  } catch (err) {
    console.error('[admin/projects] update failed:', err)
    return NextResponse.json({ error: 'update-failed' }, { status: 500 })
  }
}
