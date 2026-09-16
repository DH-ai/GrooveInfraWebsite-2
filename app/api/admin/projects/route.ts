import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { revalidateProjectSurfaces } from '@/lib/revalidate'
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

export async function POST(request: Request) {
  const auth = await checkAdminAuth()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  const parsed = createProjectSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid', detail: firstIssueMessage(parsed.error) },
      { status: 400 }
    )
  }

  const body = parsed.data
  const slug = sanitizeSlug(body.slug || body.title)
  if (!slug) {
    return NextResponse.json({ error: 'invalid-slug' }, { status: 400 })
  }

  for (const url of body.images) {
    if (!isAllowedImageUrl(url)) {
      return NextResponse.json({ error: 'invalid-image-url', url }, { status: 400 })
    }
  }

  if (body.cover_image && !isAllowedImageUrl(body.cover_image)) {
    return NextResponse.json({ error: 'invalid-cover-url' }, { status: 400 })
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
    title: body.title,
    slug,
    category: body.category ?? DEFAULT_CATEGORY,
    location: body.location ?? '',
    client_name: body.client_name ?? '',
    basic_description: body.basic_description ?? '',
    description: body.description ?? '',
    duration: body.duration ?? '',
    images: body.images,
  }

  if (body.year !== undefined) row.year = body.year
  if (body.area) row.area = body.area
  if (body.cover_image) row.cover_image = body.cover_image

  const { error: insertError } = await supabase.from('projects').insert(row)
  if (insertError) {
    console.error('[admin/projects] insert failed:', insertError.message)
    return NextResponse.json({ error: 'insert-failed' }, { status: 500 })
  }

  revalidateProjectSurfaces(slug)

  return NextResponse.json({ ok: true, slug })
}
