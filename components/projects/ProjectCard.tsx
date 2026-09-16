import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ProjectCardData } from '@/types/project'
import { formatCategory } from '@/lib/utils'
import ProjectImage from '@/components/ui/ProjectImage'

interface ProjectCardProps {
  project: ProjectCardData
}

/**
 * A project as a plate with a caption under it.
 *
 * This was a rounded, bordered, drop-shadowed tile that lifted on hover, with the
 * category floating over the photograph in a translucent pill and a location pin
 * icon beside the place name. Six pieces of chrome around one photograph. Here
 * the frame is square and unbordered, the caption sits below it on a hairline,
 * and the only thing that moves is the image itself.
 *
 * No longer a client component — the hover states are CSS, so a portfolio of
 * thirty projects ships no JavaScript for its cards.
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const { summary } = project

  return (
    <article>
      <Link href={`/projects/${project.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <ProjectImage
            image={project.imagery.cover}
            alt={project.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div className="mt-5 border-t border-subtle pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-micro uppercase tracking-eyebrow text-accent-gold">
              {formatCategory(project.category)}
            </p>
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="shrink-0 text-muted-custom transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-gold"
            />
          </div>

          <h3 className="mt-3 font-display text-h3 font-semibold text-primary transition-colors duration-300 group-hover:text-accent-gold">
            {project.title}
          </h3>

          <p className="nums-tabular mt-2 text-meta text-muted-custom">
            {project.location}
            {project.year && (
              <>
                <span aria-hidden="true" className="px-2 text-muted-custom/50">
                  ·
                </span>
                {project.year}
              </>
            )}
          </p>

          {summary && <p className="mt-4 text-body text-secondary">{summary}</p>}

          {(project.area || project.duration) && (
            <p className="nums-tabular mt-4 text-micro uppercase tracking-eyebrow text-muted-custom">
              {[project.area, project.duration].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
