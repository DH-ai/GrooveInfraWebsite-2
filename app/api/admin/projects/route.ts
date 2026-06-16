import { NextResponse } from 'next/server'
import { getSupabaseAdmin, PROJECTS_BUCKET } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { CATEGORY_OPTIONS, sanitizeSlug } from '@/lib/upload-constants'

interface CreateProjectBody {
  title?: string
  slug?: string
  category?: string
  location?: string
  client_name?: string
  basic_description?: string
  description?: string
  duration?: string
  area?: string
  year?: string | number
  cover_image?: string | null
  images?: string[]
}

const DEFAULT_CATEGORY = 'commercial'

function getPublicUrlPrefix(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${PROJECTS_BUCKET}/`
}

function isAllowedImageUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith(getPublicUrlPrefix())
}

export async function POST(request: Request) {
  const auth = checkAdminAuth()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  let body: CreateProjectBody
  try {
    body = (await request.json()) as CreateProjectBody
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  const title = String(body.title ?? '').trim()
  const slugInput = String(body.slug ?? '').trim()
  const slug = sanitizeSlug(slugInput || title)
  const categoryInput = String(body.category ?? '').trim()
  const category = categoryInput || DEFAULT_CATEGORY
  const location = String(body.location ?? '').trim()
  const clientName = String(body.client_name ?? '').trim()
  const basicDescription = String(body.basic_description ?? '').trim()
  const description = String(body.description ?? '').trim()
  const duration = String(body.duration ?? '').trim()
  const area = String(body.area ?? '').trim()
  const yearRaw = body.year == null ? '' : String(body.year).trim()
  const coverImageRaw = body.cover_image == null ? '' : String(body.cover_image).trim()
  const images = Array.isArray(body.images) ? body.images.map((v) => String(v).trim()) : []

  if (!title || !slug) {
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

  if (images.length === 0) {
    return NextResponse.json({ error: 'images-required' }, { status: 400 })
  }
  for (const url of images) {
    if (!isAllowedImageUrl(url)) {
      return NextResponse.json({ error: 'invalid-image-url', url }, { status: 400 })
    }
  }

  let coverImage: string | undefined
  if (coverImageRaw) {
    if (!isAllowedImageUrl(coverImageRaw)) {
      return NextResponse.json({ error: 'invalid-cover-url' }, { status: 400 })
    }
    coverImage = coverImageRaw
  }

  const supabase = getSupabaseAdmin()

  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    console.error('[admin/projects] existence check failed:', existingError.message)
    return NextResponse.json({ error: 'db-error' }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ error: 'slug-exists' }, { status: 409 })
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
    images,
  }

  if (year !== undefined) row.year = year
  if (area) row.area = area
  if (coverImage) row.cover_image = coverImage

  const { error: insertError } = await supabase.from('projects').insert(row)
  if (insertError) {
    console.error('[admin/projects] insert failed:', insertError.message)
    return NextResponse.json({ error: 'insert-failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug })
}
