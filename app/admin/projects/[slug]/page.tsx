import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getProjectBySlug } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'
import EditProjectForm from '@/components/admin/EditProjectForm'
import Notice from '@/components/ui/Notice'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import { chipButtonClass, dangerChipButtonClass } from '@/components/ui/field-styles'

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
  await requireAdmin()

  const project = await getProjectBySlug(params.slug)
  if (!project) {
    redirect('/admin?error=not-found')
  }

  const success = searchParams?.success === '1'
  const error = searchParams?.error

  return (
    <PageShell>
      <div className="mx-auto max-w-[72rem]">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader label="Admin" title={project.title} className="flex-1">
            <p className="mt-6 text-meta text-muted-custom">/{project.slug}</p>
          </PageHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/projects/${project.slug}`} className={chipButtonClass}>
              View project
            </Link>
            <Link href="/admin" className={chipButtonClass}>
              Back to admin
            </Link>
          </div>
        </div>

        {success && (
          <Notice tone="success" className="mt-12">
            Project updated.
          </Notice>
        )}

        {error && (
          <Notice tone="error" className="mt-12">
            {error === 'invalid'
              ? 'Please fill all required fields.'
              : error === 'update-failed'
                ? 'Unable to update the project.'
                : 'Something went wrong while updating.'}
          </Notice>
        )}

        <div className="mt-16">
          <EditProjectForm project={project} />
        </div>

        <div className="mt-14 border-t border-subtle pt-10">
          <DeleteProjectForm
            action={`/api/admin/projects/${project.slug}`}
            projectTitle={project.title}
            buttonLabel="Delete project"
            buttonClassName={dangerChipButtonClass}
          />
        </div>
      </div>
    </PageShell>
  )
}
