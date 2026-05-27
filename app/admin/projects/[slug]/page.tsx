import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'
import EditProjectForm from '@/components/admin/EditProjectForm'

export const metadata: Metadata = {
  title: 'Edit Project',
}

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

        <EditProjectForm project={project} />

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
