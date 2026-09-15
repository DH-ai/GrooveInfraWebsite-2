/**
 * Single source of truth for site-wide identity and canonical URLs.
 *
 * The canonical host is the www subdomain; the apex should redirect to it at the
 * DNS/hosting layer. Anything that builds an absolute URL must go through here,
 * so a domain change is one edit rather than a search across metadata, the
 * sitemap and robots.
 */

const FALLBACK_URL = 'https://www.grooveinfra.in'

/**
 * Vercel exposes the deployment host but not the scheme, and preview
 * deployments get a generated hostname. Preferring an explicit
 * NEXT_PUBLIC_SITE_URL keeps production canonical while letting a preview
 * describe itself accurately.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`

  return FALLBACK_URL
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = 'Groove Infra'

export const SITE_TAGLINE = 'Premium Interior Construction'

export const SITE_DESCRIPTION =
  'Groove Infra delivers premium interior construction — retail fit-outs, corporate offices, hospitality, and residential spaces crafted with precision.'

export const SITE_LOCALE = 'en_IN'

/** Where the business physically operates, used in the organisation markup. */
export const SITE_REGIONS = ['Delhi', 'Gurgaon', 'Noida', 'NCR']

/**
 * The address the site publishes for enquiries, read from the environment rather
 * than written into the source so the enquiry inbox is configured in one place
 * and cannot drift between the footer, the contact page and the JSON-LD.
 *
 * Null when unset, and callers omit the row entirely rather than rendering a
 * placeholder: a dead mailto: link is worse than no link.
 */
export const CONTACT_EMAIL = process.env.PUBLIC_CONTACT_EMAIL ?? null

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString()
}
