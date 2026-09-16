'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types/project'
import {
  buildCoverPath,
  buildGalleryPath,
  uploadFilesToSupabase,
  validateImageFile,
  type PlannedUpload,
} from '@/lib/admin-upload'
import Notice from '@/components/ui/Notice'
import {
  fieldInputClass,
  fieldLabelStackClass,
  fieldTextareaClass,
  filePickerClass,
  primaryButtonClass,
} from '@/components/ui/field-styles'

const CATEGORIES = ['commercial', 'retail', 'residential', 'civil'] as const

interface EditProjectFormProps {
  project: Project
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(project.title)
  const [category, setCategory] = useState(project.category)
  const [location, setLocation] = useState(project.location)
  const [year, setYear] = useState(project.year != null ? String(project.year) : '')
  const [clientName, setClientName] = useState(project.client_name)
  const [duration, setDuration] = useState(project.duration ?? '')
  const [area, setArea] = useState(project.area ?? '')
  const [basicDescription, setBasicDescription] = useState(project.basic_description ?? '')
  const [description, setDescription] = useState(project.description)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [replaceGallery, setReplaceGallery] = useState(false)
  const [busy, setBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!title.trim() || !category || !location.trim() || !clientName.trim() ||
        !basicDescription.trim() || !description.trim() || !duration.trim()) {
      setErrorMsg('Please fill all required fields.')
      return
    }
    if (replaceGallery && galleryFiles.length === 0) {
      setErrorMsg('Please choose at least one gallery image when replacing.')
      return
    }
    if (coverFile) {
      const err = validateImageFile(coverFile)
      if (err) {
        setErrorMsg(err)
        return
      }
    }
    for (const f of galleryFiles) {
      const err = validateImageFile(f)
      if (err) {
        setErrorMsg(err)
        return
      }
    }

    setBusy(true)
    try {
      const slug = project.slug
      const planned: PlannedUpload[] = []
      if (coverFile) {
        planned.push({ file: coverFile, path: buildCoverPath(slug, coverFile) })
      }

      const startIndex = replaceGallery ? 1 : project.images.length + 1
      galleryFiles.forEach((file, idx) => {
        planned.push({ file, path: buildGalleryPath(slug, startIndex + idx, file) })
      })

      let coverUrl: string | null | undefined = undefined
      let newGalleryUrls: string[] = []

      if (planned.length > 0) {
        setStatusMsg(`Uploading ${planned.length} file${planned.length === 1 ? '' : 's'}…`)
        const uploaded = await uploadFilesToSupabase(planned)

        if (coverFile) {
          const path = buildCoverPath(slug, coverFile)
          coverUrl = uploaded.find((u) => u.path === path)?.publicUrl ?? null
        }
        newGalleryUrls = galleryFiles.map((file, idx) => {
          const path = buildGalleryPath(slug, startIndex + idx, file)
          return uploaded.find((u) => u.path === path)!.publicUrl
        })
      }

      setStatusMsg('Saving project…')
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          location: location.trim(),
          client_name: clientName.trim(),
          basic_description: basicDescription.trim(),
          description: description.trim(),
          duration: duration.trim(),
          area: area.trim(),
          year: year.trim(),
          cover_image: coverUrl,
          images: newGalleryUrls,
          remove_cover: removeCover,
          replace_gallery: replaceGallery,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(`Save failed: ${data.error ?? res.status}`)
        return
      }

      router.push(`/admin/projects/${slug}?success=1`)
      router.refresh()
    } catch (err) {
      console.error('[EditProjectForm] failed:', err)
      setErrorMsg((err as Error).message || 'Upload failed.')
    } finally {
      setBusy(false)
      setStatusMsg(null)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-10 border-t border-strong pt-10"
    >
      {errorMsg && (
        <Notice tone="error" live>
          {errorMsg}
        </Notice>
      )}
      {statusMsg && (
        <Notice tone="info" live>
          {statusMsg}
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <label className={fieldLabelStackClass}>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldInputClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Slug
          <input
            readOnly
            value={project.slug}
            className={`${fieldInputClass} text-muted-custom`}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Category
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={fieldInputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label className={fieldLabelStackClass}>
          Location
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={fieldInputClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Year
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={fieldInputClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Client name
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={fieldInputClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Time to complete
          <input
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={fieldInputClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Area (optional)
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={fieldInputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <label className={fieldLabelStackClass}>
          Basic description
          <textarea
            required
            rows={2}
            value={basicDescription}
            onChange={(e) => setBasicDescription(e.target.value)}
            className={fieldTextareaClass}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldTextareaClass}
          />
        </label>
      </div>

      <div className="space-y-3">
        <label className={fieldLabelStackClass}>
          Replace cover image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className={filePickerClass}
          />
          {project.cover_image && !removeCover && (
            <span className="text-meta normal-case tracking-normal text-muted-custom">
              Current cover will be kept unless you upload a new file.
            </span>
          )}
        </label>
        <label className="flex min-h-11 items-center gap-3 text-meta text-secondary">
          <input
            type="checkbox"
            checked={removeCover}
            onChange={(e) => setRemoveCover(e.target.checked)}
            className="h-4 w-4 border-strong bg-base"
          />
          Remove cover image
        </label>
      </div>

      <div className="space-y-3">
        <label className={fieldLabelStackClass}>
          Add gallery images (optional)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
            }
            className={filePickerClass}
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-meta text-secondary">
          <input
            type="checkbox"
            checked={replaceGallery}
            onChange={(e) => setReplaceGallery(e.target.checked)}
            className="h-4 w-4 border-strong bg-base"
          />
          Replace existing gallery images
        </label>
        <p className="text-meta normal-case tracking-normal text-muted-custom">
          Current gallery images: {project.images.length}. If you replace, upload new images.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className={primaryButtonClass}
      >
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
