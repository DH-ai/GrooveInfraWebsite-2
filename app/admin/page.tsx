import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAllProjects } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'
import CreateProjectForm from '@/components/admin/CreateProjectForm'

export const metadata: Metadata = {
  title: 'Admin',
}

interface AdminPageProps {
  searchParams?: {
    success?: string
    deleted?: string
    error?: string
    slug?: string
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    redirect('/admin/login?error=missing-config')
  }

  const token = cookies().get('admin_auth')?.value
  if (!token || token !== adminToken) {
    redirect('/admin/login')
  }

  const projects = await getAllProjects()
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

        <CreateProjectForm />

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
