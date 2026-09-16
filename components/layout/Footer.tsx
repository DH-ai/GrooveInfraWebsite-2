import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/site'

const footerLinks = {
  Services: [
    { label: 'Retail Rollouts', href: '/projects?category=retail' },
    { label: 'Hospitality & Clubs', href: '/projects?category=commercial' },
    { label: 'Commercial Renovation', href: '/projects?category=commercial' },
    { label: 'Residential Makeovers', href: '/projects?category=residential' },
  ],
  Company: [
    { label: 'Portfolio', href: '/projects' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-subtle bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-groove-gold"
              >
                <span className="font-display text-xs font-bold text-black">G</span>
              </span>
              <span className="font-display font-semibold text-base tracking-widest uppercase text-primary">
                Groove Infra
              </span>
            </Link>
            <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xs">
              Premium interior construction for retail, commercial, hospitality, and residential
              projects across India since 2016.
            </p>
            <div className="flex flex-col text-sm text-secondary">
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent-gold"
                >
                  <Mail size={13} aria-hidden="true" /> {CONTACT_EMAIL}
                </a>
              )}
              <a href="tel:+918800385198" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent-gold">
                <Phone size={13} aria-hidden="true" /> +91 88003 85198
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Plot+No-416%2F2%2C+Metro+Pillar+No-127%2C+Mehrauli-Gurgaon+Rd%2C+Ghitorni%2C+New+Delhi%2C+Delhi+110030"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-start gap-2 py-2 transition-colors hover:text-accent-gold"
              >
                <MapPin size={13} aria-hidden="true" className="mt-0.5 flex-shrink-0" />
                <span>
                  Plot No-416/2, Metro Pillar No-127, Mehrauli-Gurgaon Rd, Ghitorni, New Delhi, Delhi
                  110030
                </span>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-5">
                {title}
              </h3>
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-secondary transition-colors duration-200 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-5">
              Start a Project
            </h3>
            <p className="text-sm text-secondary mb-5">
              Have a space to transform? Let&apos;s talk.
            </p>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full px-6 bg-groove-gold text-black text-xs font-semibold tracking-wider uppercase hover:shadow-gold transition-all duration-300 hover:scale-105"
            >
              Enquire
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-custom">
          <span>© {new Date().getFullYear()} Groove Infra. All rights reserved.</span>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-primary"
            >
              Terms &amp; Conditions
            </Link>
          </nav>
          <span>Crafted with precision in Delhi, India.</span>
        </div>
      </div>
    </footer>
  )
}
