import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_REGIONS, SITE_URL } from '@/lib/site'

/**
 * Organisation markup for search engines. Emitted once from the root layout.
 *
 * The address and phone number are already published on the contact page and in
 * the footer, so nothing here is newly disclosed.
 *
 * The email comes from PUBLIC_CONTACT_EMAIL and is omitted entirely when that is
 * unset, rather than carrying a hardcoded fallback. That keeps the address in one
 * place and guarantees the private enquiry inbox can never leak in here.
 */

const publicEmail = process.env.PUBLIC_CONTACT_EMAIL

const schema = {
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  logo: absoluteUrl('/icon.png'),
  image: absoluteUrl('/opengraph-image.png'),
  telephone: '+91-88003-85198',
  ...(publicEmail ? { email: publicEmail } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot No-416/2, Metro Pillar No-127, Mehrauli-Gurgaon Rd, Ghitorni',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110030',
    addressCountry: 'IN',
  },
  areaServed: SITE_REGIONS.map((name) => ({ '@type': 'Place', name })),
  foundingDate: '2016',
}

export default function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      // Serialised from a literal defined above, so there is no user input to escape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
