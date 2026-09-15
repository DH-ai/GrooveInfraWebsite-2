import type { MetadataRoute } from 'next'
import { getProjectSitemapEntries } from '@/lib/projects'
import { absoluteUrl } from '@/lib/site'

/**
 * Regenerated on the same interval as the project pages, so a project added
 * through the admin panel appears here without a redeploy.
 */
export const revalidate = 300

/**
 * Only publicly indexable routes belong here. /innovation is unfinished and
 * disallowed in robots.ts, and everything under /admin and /api is private, so
 * listing any of them would contradict robots.ts.
 */
const staticRoutes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectSitemapEntries()
  const now = new Date()

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
