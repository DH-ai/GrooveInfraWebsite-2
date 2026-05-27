import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { PROJECTS_BUCKET } from '@/lib/supabase'
import { ALLOWED_IMAGE_EXTENSIONS, getExtension } from '@/lib/upload-constants'

export interface PlannedUpload {
  file: File
  path: string
}

export interface UploadResult {
  path: string
  publicUrl: string
}

interface SignUploadResponse {
  uploads?: Array<{
    path: string
    signedUrl: string
    token: string
    publicUrl: string
  }>
  error?: string
}

export function validateImageFile(file: File): string | null {
  const ext = getExtension(file.name)
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return `Unsupported file type: ${file.name}`
  }
  return null
}

export function buildCoverPath(slug: string, file: File): string {
  return `${slug}/cover${getExtension(file.name)}`
}

export function buildGalleryPath(slug: string, index: number, file: File): string {
  const padded = String(index).padStart(2, '0')
  return `${slug}/image-${padded}${getExtension(file.name)}`
}

export async function uploadFilesToSupabase(planned: PlannedUpload[]): Promise<UploadResult[]> {
  if (planned.length === 0) return []

  const res = await fetch('/api/admin/projects/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths: planned.map((p) => p.path) }),
  })
  const data = (await res.json().catch(() => ({}))) as SignUploadResponse
  if (!res.ok || !data.uploads) {
    throw new Error(data.error ?? `sign-upload failed (${res.status})`)
  }

  const tokenByPath = new Map(data.uploads.map((u) => [u.path, u]))
  const supabase = getSupabaseBrowser()

  await Promise.all(
    planned.map(async ({ file, path }) => {
      const entry = tokenByPath.get(path)
      if (!entry) throw new Error(`Missing signed token for ${path}`)
      const { error } = await supabase.storage
        .from(PROJECTS_BUCKET)
        .uploadToSignedUrl(path, entry.token, file, {
          upsert: true,
          contentType: file.type || 'image/jpeg',
        })
      if (error) {
        throw new Error(`Upload failed for ${path}: ${error.message}`)
      }
    })
  )

  return planned.map(({ path }) => {
    const entry = tokenByPath.get(path)!
    return { path, publicUrl: entry.publicUrl }
  })
}
