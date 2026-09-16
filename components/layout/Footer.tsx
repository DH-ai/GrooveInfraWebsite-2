import Link from 'next/link'
import { CONTACT_EMAIL } from '@/lib/site'

const PHONE_DISPLAY = '+91 88003 85198'
const PHONE_HREF = '+918800385198'
const ADDRESS_LINES = [
  'Plot No-416/2, Metro Pillar No-127',
  'Mehrauli-Gurgaon Rd, Ghitorni',
  'New Delhi 110030',
]
const MAP_HREF =
  'https://www.google.com/maps/search/?api=1&query=Plot+No-416%2F2%2C+Metro+Pillar+No-127%2C+Mehrauli-Gurgaon+Rd%2C+Ghitorni%2C+New+Delhi%2C+Delhi+110030'

const columns = [
  {
    title: 'Sectors',
    links: [
      { label: 'Retail rollouts', href: '/projects?category=retail' },
      { label: 'Hospitality and clubs', href: '/projects?category=commercial' },
      { label: 'Workplace and commercial', href: '/projects?category=commercial' },
      { label: 'Residential', href: '/projects?category=residential' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'Portfolio', href: '/projects' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

/**
 * The footer, on the same rules as the rest of the site.
 *
 * The icons beside the email, phone and address are gone: a 13px envelope next to
 * an email address is decoration standing where a label would be more useful, and
 * three of them turn the contact block into a legend. The address is set on its
 * own lines the way it would be written on an envelope rather than wrapped as one
 * long sentence.
 */
export default function Footer() {
  return (
    <footer className="gutter border-t border-subtle bg-surface">
      <div className="mx-auto w-full max-w-[100rem]">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 py-20 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center bg-groove-gold"
              >
                <span className="font-display text-xs font-bold text-black">G</span>
              </span>
              <span className="font-display text-base font-semibold uppercase tracking-widest text-primary">
                Groove Infra
              </span>
            </Link>

            <p className="measure-tight mt-6 text-body text-secondary">
              Interior construction for retail, workplace, hospitality and residential projects
              across India. Building since 2016.
            </p>

            <address className="mt-8 not-italic">
              <p className="text-meta text-muted-custom">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <a
                href={MAP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center underline decoration-1 underline-offset-[7px] decoration-subtle text-meta text-secondary transition-colors hover:decoration-groove-gold hover:text-primary"
              >
                Open in maps
              </a>
            </address>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-muted-custom">
                {column.title}
              </h2>
              <ul className="mt-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-meta text-secondary transition-colors duration-200 hover:text-accent-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="border-t border-strong pt-4 text-micro uppercase tracking-eyebrow text-muted-custom">
              Enquiries
            </h2>
            <ul className="mt-2">
              {CONTACT_EMAIL && (
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex min-h-11 items-center text-meta text-secondary transition-colors hover:text-accent-gold"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`tel:${PHONE_HREF}`}
                  className="nums-tabular inline-flex min-h-11 items-center text-meta text-secondary transition-colors hover:text-accent-gold"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>

            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-11 items-center bg-groove-gold px-6 text-micro font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
            >
              Start an enquiry
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-1 border-t border-subtle py-5 text-micro text-muted-custom sm:flex-row sm:items-center">
          <p className="nums-tabular">© {new Date().getFullYear()} Groove Infra</p>
          <nav aria-label="Legal" className="flex items-center gap-8">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-primary"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
