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

    if (!title.trim() || !category || !location.trim() || !clientName.trim() ||
        !basicDescription.trim() || !description.trim() || !duration.trim()) {
      setErrorMsg('Please fill all required fields.')
      return
    }
    if (!computedSlug) {
      setErrorMsg('Slug is required.')
      return
    }
    if (galleryFiles.length === 0) {
      setErrorMsg('Please add at least one gallery image.')
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
      className="rounded-3xl bg-surface-2 border border-subtle p-6 sm:p-8 space-y-8"
    >
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div className="rounded-2xl border border-groove-gold/30 bg-groove-gold/5 px-4 py-3 text-sm text-primary">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="Project title"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Slug (auto if empty)
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder={computedSlug || 'bata-india-office'}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Category
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
          >
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Location
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="Gurgaon, Haryana"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Year
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="2025"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Client name
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="Bata India LTD"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Time to complete
          <input
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="25 weeks"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Area (optional)
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            placeholder="10,000 sq ft"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Basic description
          <textarea
            required
            rows={2}
            value={basicDescription}
            onChange={(e) => setBasicDescription(e.target.value)}
            className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
            placeholder="Short summary used on cards."
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
            placeholder="Full project description for the detail page."
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Cover image (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="file:mr-4 file:rounded-full file:border-0 file:bg-groove-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black text-secondary"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-secondary">
        Gallery images (multiple)
        <input
          type="file"
          accept="image/*"
          multiple
          required
          onChange={(e) =>
            setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
          }
          className="file:mr-4 file:rounded-full file:border-0 file:bg-groove-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black text-secondary"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-groove-gold text-black text-sm font-semibold hover:shadow-gold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? 'Saving…' : 'Save project'}
      </button>
    </form>
  )
}
