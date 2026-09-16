'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildCoverPath,
  buildGalleryPath,
  uploadFilesToSupabase,
  validateImageFile,
  type PlannedUpload,
} from '@/lib/admin-upload'
import { sanitizeSlug } from '@/lib/upload-constants'
import Notice from '@/components/ui/Notice'
import {
  fieldInputClass,
  fieldLabelStackClass,
  fieldTextareaClass,
  filePickerClass,
  primaryButtonClass,
} from '@/components/ui/field-styles'

const CATEGORIES = ['commercial', 'retail', 'residential', 'civil'] as const

export default function CreateProjectForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [year, setYear] = useState('')
  const [clientName, setClientName] = useState('')
  const [duration, setDuration] = useState('')
  const [area, setArea] = useState('')
  const [basicDescription, setBasicDescription] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const computedSlug = useMemo(
    () => sanitizeSlug(slug.trim() || title.trim()),
    [slug, title]
  )

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!title.trim()) {
      setErrorMsg('Project title is required.')
      return
    }
    if (!computedSlug) {
      setErrorMsg('Slug is required.')
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
      const planned: PlannedUpload[] = []
      if (coverFile) {
        planned.push({ file: coverFile, path: buildCoverPath(computedSlug, coverFile) })
      }
      galleryFiles.forEach((file, idx) => {
        planned.push({ file, path: buildGalleryPath(computedSlug, idx + 1, file) })
      })

      setStatusMsg(`Uploading ${planned.length} file${planned.length === 1 ? '' : 's'}…`)
      const uploaded = await uploadFilesToSupabase(planned)

      const coverUrl = coverFile
        ? uploaded.find((u) => u.path === buildCoverPath(computedSlug, coverFile))?.publicUrl ?? null
        : null
      const galleryUrls = galleryFiles.map((file, idx) => {
        const path = buildGalleryPath(computedSlug, idx + 1, file)
        return uploaded.find((u) => u.path === path)!.publicUrl
      })

      setStatusMsg('Saving project…')
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: computedSlug,
          category,
          location: location.trim(),
          client_name: clientName.trim(),
          basic_description: basicDescription.trim(),
          description: description.trim(),
          duration: duration.trim(),
          area: area.trim(),
          year: year.trim(),
          cover_image: coverUrl,
          images: galleryUrls,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; slug?: string; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(`Save failed: ${data.error ?? res.status}`)
        return
      }

      router.push(`/admin?success=1&slug=${data.slug ?? computedSlug}`)
      router.refresh()
    } catch (err) {
      console.error('[CreateProjectForm] failed:', err)
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
            placeholder="Project title"
          />
        </label>
        <label className={fieldLabelStackClass}>
          Slug (auto if empty)
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={fieldInputClass}
            placeholder={computedSlug || 'bata-india-office'}
          />
        </label>
        <label className={fieldLabelStackClass}>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldInputClass}
          >
            <option value="">Select category (optional)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label className={fieldLabelStackClass}>
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={fieldInputClass}
            placeholder="Gurgaon, Haryana"
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
            placeholder="2025"
          />
        </label>
        <label className={fieldLabelStackClass}>
          Client name
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={fieldInputClass}
            placeholder="Bata India LTD"
          />
        </label>
        <label className={fieldLabelStackClass}>
          Time to complete
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={fieldInputClass}
            placeholder="25 weeks"
          />
        </label>
        <label className={fieldLabelStackClass}>
          Area (optional)
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={fieldInputClass}
            placeholder="10,000 sq ft"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <label className={fieldLabelStackClass}>
          Basic description
          <textarea
            rows={2}
            value={basicDescription}
            onChange={(e) => setBasicDescription(e.target.value)}
            className={fieldTextareaClass}
            placeholder="Short summary used on cards."
          />
        </label>
        <label className={fieldLabelStackClass}>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldTextareaClass}
            placeholder="Full project description for the detail page."
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <label className={fieldLabelStackClass}>
          Cover image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className={filePickerClass}
          />
        </label>
      </div>

      <label className={fieldLabelStackClass}>
        Gallery images (optional, multiple)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
          }
          className={filePickerClass}
        />
        <span className="text-meta normal-case tracking-normal text-muted-custom">
          Leave empty to publish now and add photography later. The project will show a generated
          plate until images are uploaded, then switch to them automatically.
        </span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className={primaryButtonClass}
      >
        {busy ? 'Saving…' : 'Save project'}
      </button>
    </form>
  )
}
