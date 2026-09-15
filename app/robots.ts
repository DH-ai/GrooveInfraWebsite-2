import type { MetadataRoute } from 'next'
import { absoluteUrl, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Unfinished, and deliberately not linked from the nav.
        '/innovation',
        // Private surfaces. Crawlers cannot authenticate, so these would only
        // ever yield the login page or a 401.
        '/admin',
        '/api/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
