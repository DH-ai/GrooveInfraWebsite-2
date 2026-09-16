/**
 * Cache tag applied to every Supabase read of the projects table.
 *
 * Next.js caches `fetch` responses in its Data Cache, and supabase-js issues its
 * queries through `fetch`. Page-level `revalidate` alone is not enough: the Data
 * Cache can outlive a rebuild, so a fresh deploy could prerender stale project
 * data. Tagging the reads lets admin mutations invalidate the underlying data as
 * well as the rendered routes.
 */
export const PROJECTS_CACHE_TAG = 'projects'
