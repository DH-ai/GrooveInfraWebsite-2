import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { getAllEnquiries } from '@/lib/enquiries'
import { getAllProjects } from '@/lib/projects'
import DeleteProjectForm from '@/components/admin/DeleteProjectForm'
import CreateProjectForm from '@/components/admin/CreateProjectForm'
import EnquiryList from '@/components/admin/EnquiryList'
import Notice from '@/components/ui/Notice'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import SectionHead from '@/components/ui/SectionHead'
import { chipButtonClass, dangerChipButtonClass, quietButtonClass } from '@/components/ui/field-styles'

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

function errorMessage(error: string): string {
  switch (error) {
    case 'slug-exists':
      return 'A project with that slug already exists.'
    case 'invalid':
      return 'Please fill all required fields.'
    case 'not-found':
      return 'Project not found.'
    case 'delete-failed':
      return 'Unable to delete the project.'
    default:
      return 'Something went wrong while saving the project.'
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin()

  const [projects, enquiries] = await Promise.all([getAllProjects(), getAllEnquiries()])
  // Which projects are still showing a drawn plate rather than the client's own
  // photography. Without this the swap is invisible from the admin panel and the
  // only way to audit it is to open every project page.
  const awaitingPhotography = projects.filter((p) => !p.imagery.hasOwnPhotography)
  const successSlug = searchParams?.success === '1' ? searchParams.slug : undefined
  const deletedSlug = searchParams?.deleted === '1' ? searchParams.slug : undefined
  const error = searchParams?.error

  return (
    <PageShell>
      <div className="mx-auto max-w-[72rem]">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            label="Admin"
            title="Projects and enquiries."
            className="flex-1"
          />
          <form action="/api/admin/logout" method="post">
            <button type="submit" className={quietButtonClass}>
              Sign out
            </button>
          </form>
        </div>

        {successSlug && (
          <Notice tone="success" className="mt-12">
            Project created. View it at{' '}
            <Link href={`/projects/${successSlug}`} className="underline underline-offset-2">
              /projects/{successSlug}
            </Link>
            .
          </Notice>
        )}

        {deletedSlug && (
          <Notice tone="success" className="mt-12">
            Project deleted: <span className="font-semibold">{deletedSlug}</span>.
          </Notice>
        )}

        {error && (
          <Notice tone="error" className="mt-12">
            {errorMessage(error)}
          </Notice>
        )}

        <section className="mt-20">
          <SectionHead index="01" label="New project" />
          <div className="mt-12">
            <CreateProjectForm />
          </div>
        </section>

        <section className="mt-24">
          <SectionHead
            index="02"
            label="Enquiries"
            aside={enquiries.length > 0 ? `${enquiries.length} received` : undefined}
          />
          <div className="mt-12">
            <EnquiryList enquiries={enquiries} />
          </div>
        </section>

        {projects.length > 0 && (
          <section className="mt-24">
            <SectionHead
              index="03"
              label="Existing projects"
              aside={`${projects.length} published`}
            />

            {awaitingPhotography.length > 0 && (
              <Notice
                tone="warning"
                data-testid="awaiting-photography-summary"
                className="mt-12"
              >
                <span className="font-semibold">
                  {awaitingPhotography.length} of {projects.length} projects
                </span>{' '}
                have no uploaded photography and are showing a generated plate. Upload images to a
                project and it takes over automatically — nothing else needs changing.
              </Notice>
            )}

            {/*
              A ruled list rather than a grid of rounded cards. Each row is one
              project, and the state of its photography sits in the same column
              on every row so the list can be scanned down rather than read.
            */}
            <ul className="mt-12 border-b border-subtle">
              {projects.map((project) => (
                <li
                  key={project.slug}
                  className="grid grid-cols-1 items-baseline gap-x-8 gap-y-4 border-t border-subtle py-6 lg:grid-cols-[minmax(0,1fr)_11rem_auto]"
                >
                  <div>
                    <div className="font-display text-lede font-semibold text-primary">
                      {project.title}
                    </div>
                    <div className="mt-1 text-meta text-muted-custom">/{project.slug}</div>
                  </div>

                  <div>
                    {project.imagery.hasOwnPhotography ? (
                      <span className="inline-flex items-center border-l-2 border-emerald-400 bg-emerald-500/10 px-3 py-1 text-micro uppercase tracking-eyebrow text-emerald-100">
                        {`${project.imagery.ownedCount} ${
                          project.imagery.ownedCount === 1 ? 'photo' : 'photos'
                        }`}
                      </span>
                    ) : (
                      <span
                        data-testid="placeholder-badge"
                        className="inline-flex items-center border-l-2 border-amber-400 bg-amber-500/10 px-3 py-1 text-micro uppercase tracking-eyebrow text-amber-100"
                      >
                        Generated plate
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/projects/${project.slug}`} className={chipButtonClass}>
                      View
                    </Link>
                    <Link href={`/admin/projects/${project.slug}`} className={chipButtonClass}>
                      Edit
                    </Link>
                    <DeleteProjectForm
                      action={`/api/admin/projects/${project.slug}`}
                      projectTitle={project.title}
                      buttonClassName={dangerChipButtonClass}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  )
}
