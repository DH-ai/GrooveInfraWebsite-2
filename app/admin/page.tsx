import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'

export const metadata: Metadata = {
  title: 'Admin',
}

const CATEGORIES = ['commercial', 'retail', 'residential', 'civil'] as const

interface AdminPageProps {
  searchParams?: {
    success?: string
    deleted?: string
    error?: string
    slug?: string
  }
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    redirect('/admin/login?error=missing-config')
  }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) {
    redirect('/admin/login')
  }

  const projects = getAllProjects()
  const successSlug = searchParams?.success === '1' ? searchParams.slug : undefined
  const deletedSlug = searchParams?.deleted === '1' ? searchParams.slug : undefined
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
              Upload New Project
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-subtle text-sm text-secondary hover:text-primary hover:border-groove-gold/50 transition-all"
            >
              Logout
            </button>
          </form>
        </div>

        {successSlug && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Project created. View it at{' '}
            <Link href={`/projects/${successSlug}`} className="underline underline-offset-2">
              /projects/{successSlug}
            </Link>
            .
          </div>
        )}

        {deletedSlug && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Project deleted: <span className="font-semibold">{deletedSlug}</span>.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error === 'slug-exists'
              ? 'A project with that slug already exists.'
              : error === 'invalid'
                ? 'Please fill all required fields.'
                : error === 'not-found'
                  ? 'Project not found.'
                  : error === 'delete-failed'
                    ? 'Unable to delete the project.'
                : 'Something went wrong while saving the project.'}
          </div>
        )}

        <form
          action="/api/admin/projects"
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
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="Project title"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Slug (auto if empty)
              <input
                name="slug"
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="bata-india-office"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Category
              <select
                name="category"
                required
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                defaultValue=""
              >
                <option value="" disabled>
                  Select category
                </option>
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
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="Gurgaon, Haryana"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Year
              <input
                name="year"
                type="number"
                min="1900"
                max="2100"
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="2025"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Client name
              <input
                name="client_name"
                required
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="Bata India LTD"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Time to complete
              <input
                name="duration"
                required
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="25 weeks"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Area (optional)
              <input
                name="area"
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="10,000 sq ft"
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
                className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
                placeholder="Short summary used on cards."
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Description
              <textarea
                name="description"
                required
                rows={4}
                className="rounded-xl border border-subtle bg-base px-4 py-3 text-primary"
                placeholder="Full project description for the detail page."
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Cover image URL (optional)
              <input
                name="cover_image_url"
                type="url"
                className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
                placeholder="https://..."
              />
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

          <label className="flex flex-col gap-2 text-sm text-secondary">
            Gallery images (multiple)
            <input
              name="gallery"
              type="file"
              accept="image/*"
              multiple
              required
              className="file:mr-4 file:rounded-full file:border-0 file:bg-groove-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black text-secondary"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-groove-gold text-black text-sm font-semibold hover:shadow-gold transition-all"
          >
            Save project
          </button>
        </form>

        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-4">
              Existing projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.slug}
                  className="rounded-2xl border border-subtle bg-surface-2 p-4 text-sm text-secondary"
                >
                  <div className="font-semibold text-primary">{project.title}</div>
                  <div className="text-xs mt-1 text-muted-custom">/{project.slug}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs text-secondary hover:text-primary hover:border-groove-gold/50 transition-all"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/projects/${project.slug}`}
                      className="inline-flex items-center rounded-full border border-subtle px-3 py-1 text-xs text-secondary hover:text-primary hover:border-groove-gold/50 transition-all"
                    >
                      Edit
                    </Link>
                    <DeleteProjectForm
                      action={`/api/admin/projects/${project.slug}`}
                      projectTitle={project.title}
                      buttonClassName="inline-flex items-center rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:border-red-500/70 hover:text-red-100 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
