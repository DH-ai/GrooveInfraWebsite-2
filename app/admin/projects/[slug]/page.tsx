import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'

export const metadata: Metadata = {
  title: 'Edit Project',
}

const CATEGORIES = ['commercial', 'retail', 'residential', 'civil'] as const

interface AdminEditPageProps {
  params: { slug: string }
  searchParams?: {
    success?: string
    error?: string
  }
}

export default async function AdminEditPage({ params, searchParams }: AdminEditPageProps) {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    redirect('/admin/login?error=missing-config')
  }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) {
    redirect('/admin/login')
  }

  const project = await getProjectBySlug(params.slug)
  if (!project) {
    redirect('/admin?error=not-found')
  }

  const success = searchParams?.success === '1'
  const error = searchParams?.error

  return (
    <div className="min-h-screen bg-base pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Admin
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary mt-3">
              Edit Project
            </h1>
            <p className="text-sm text-muted-custom mt-2">/{project.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center rounded-full border border-subtle px-4 py-2 text-sm text-secondary hover:text-primary hover:border-groove-gold/50 transition-all"
            >
              View project
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border border-subtle px-4 py-2 text-sm text-secondary hover:text-primary hover:border-groove-gold/50 transition-all"
            >
              Back to admin
            </Link>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Project updated.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error === 'invalid'
              ? 'Please fill all required fields.'
              : error === 'update-failed'
                ? 'Unable to update the project.'
                : 'Something went wrong while updating.'}
          </div>
        )}

        <form
          action={`/api/admin/projects/${project.slug}`}
          method="post"
          encType="multipart/form-data"
          className="rounded-3xl bg-surface-2 border border-subtle p-6 sm:p-8 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Title
              <input
                name="title"
                required
                defaultValue={project.title}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Slug
              <input
                name="slug"
                readOnly
                defaultValue={project.slug}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-muted-custom"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Category
              <select
                name="category"
                required
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                defaultValue={project.category}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Location
              <input
                name="location"
                required
                defaultValue={project.location}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Year
              <input
                name="year"
                type="number"
                min="1900"
                max="2100"
                defaultValue={project.year ?? ''}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Client name
              <input
                name="client_name"
                required
                defaultValue={project.client_name}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Time to complete
              <input
                name="duration"
                required
                defaultValue={project.duration ?? ''}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Area (optional)
              <input
                name="area"
                defaultValue={project.area ?? ''}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Basic description
              <textarea
                name="basic_description"
                required
                rows={2}
                defaultValue={project.basic_description ?? ''}
                className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Description
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={project.description}
                className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Cover image URL (optional)
              <input
                name="cover_image_url"
                type="url"
                defaultValue={project.cover_image ?? ''}
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="https://..."
              />
              <span className="text-xs text-muted-custom">
                Leave empty to keep existing cover unless you upload a new file.
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Cover image file (optional)
              <input
                name="cover_image_file"
                type="file"
                accept="image/*"
                className="file:mr-4 file:rounded-full file:border-0 file:bg-groove-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black text-secondary"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-secondary">
            <input
              name="remove_cover"
              type="checkbox"
              value="1"
              className="h-4 w-4 rounded border-subtle bg-base"
            />
            Remove cover image
          </label>

          <div className="space-y-3">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Add gallery images (optional)
              <input
                name="gallery"
                type="file"
                accept="image/*"
                multiple
                className="file:mr-4 file:rounded-full file:border-0 file:bg-groove-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black text-secondary"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-secondary">
              <input
                name="replace_gallery"
                type="checkbox"
                value="1"
                className="h-4 w-4 rounded border-subtle bg-base"
              />
              Replace existing gallery images
            </label>
            <p className="text-xs text-muted-custom">
              Current gallery images: {project.images.length}. If you replace, upload new images.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-groove-gold text-black text-sm font-semibold hover:shadow-gold transition-all"
          >
            Save changes
          </button>
        </form>

        <div className="mt-8">
          <DeleteProjectForm
            action={`/api/admin/projects/${project.slug}`}
            projectTitle={project.title}
            buttonLabel="Delete project"
            buttonClassName="inline-flex items-center rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:border-red-500/70 hover:text-red-100 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
