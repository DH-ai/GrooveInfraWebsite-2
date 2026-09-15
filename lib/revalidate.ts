import { revalidatePath, revalidateTag } from 'next/cache'
import { PROJECTS_CACHE_TAG } from '@/lib/cache-tags'

/**
 * Every public surface that renders project data. Admin mutations must flush all
 * of these, otherwise the portfolio grid and the detail pages disagree: the grid
 * is revalidated on a short interval while `/projects/[slug]` is prerendered at
 * build time and would otherwise stay frozen until the next deploy.
 *
 * The tag drops the cached Supabase responses, and the paths drop the rendered
 * HTML. Both are required: flushing only the routes would regenerate them from
 * stale cached query results.
 */
export function revalidateProjectSurfaces(...slugs: (string | null | undefined)[]) {
  revalidateTag(PROJECTS_CACHE_TAG)

  revalidatePath('/')
  revalidatePath('/projects')

  for (const slug of new Set(slugs.filter((s): s is string => Boolean(s)))) {
    revalidatePath(`/projects/${slug}`)
  }
}
