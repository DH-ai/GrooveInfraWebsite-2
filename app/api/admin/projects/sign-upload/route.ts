import { NextResponse } from 'next/server'
import { getSupabaseAdmin, PROJECTS_BUCKET } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import {
  ALLOWED_IMAGE_EXTENSIONS,
  getExtension,
  sanitizeSlug,
} from '@/lib/upload-constants'

interface SignUploadRequest {
  paths?: unknown
}

function isValidPath(path: string): boolean {
  if (!path || path.includes('..') || path.startsWith('/')) return false
  const parts = path.split('/')
  if (parts.length !== 2) return false
  const [slug, fileName] = parts
  if (!slug || !fileName) return false
  if (sanitizeSlug(slug) !== slug) return false
  const ext = getExtension(fileName)
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) return false
  return true
}

export async function POST(request: Request) {
  const auth = checkAdminAuth()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  let body: SignUploadRequest
  try {
    body = (await request.json()) as SignUploadRequest
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  const rawPaths = body.paths
  if (!Array.isArray(rawPaths) || rawPaths.length === 0) {
    return NextResponse.json({ error: 'paths-required' }, { status: 400 })
  }

  const paths: string[] = []
  for (const entry of rawPaths) {
    if (typeof entry !== 'string' || !isValidPath(entry)) {
      return NextResponse.json({ error: 'invalid-path', path: entry }, { status: 400 })
    }
    paths.push(entry)
  }

  const supabase = getSupabaseAdmin()
  const storage = supabase.storage.from(PROJECTS_BUCKET)

  try {
    const uploads = await Promise.all(
      paths.map(async (path) => {
        const { data, error } = await storage.createSignedUploadUrl(path, { upsert: true })
        if (error || !data) {
          throw new Error(`Failed to sign ${path}: ${error?.message ?? 'unknown error'}`)
        }
        const { data: publicData } = storage.getPublicUrl(path)
        return {
          path,
          signedUrl: data.signedUrl,
          token: data.token,
          publicUrl: publicData.publicUrl,
        }
      })
    )
    return NextResponse.json({ uploads })
  } catch (err) {
    console.error('[admin/projects/sign-upload] failed:', err)
    return NextResponse.json({ error: 'sign-failed' }, { status: 500 })
  }
}
