import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

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
              <div className="w-7 h-7 rounded-sm bg-groove-gold flex items-center justify-center">
                <span className="text-black font-display font-bold text-xs">G</span>
              </div>
              <span className="font-display font-semibold text-base tracking-widest uppercase text-primary">
                Groove Infra
              </span>
            </Link>
            <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xs">
              Premium interior construction for retail, commercial, hospitality, and residential
              projects across India since 2012.
            </p>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <a href="mailto:hello@grooveinfra.in" className="flex items-center gap-2 hover:text-accent-gold transition-colors">
                <Mail size={13} /> hello@grooveinfra.in
              </a>
              <a href="tel:+912212345678" className="flex items-center gap-2 hover:text-accent-gold transition-colors">
                <Phone size={13} /> +91 22 1234 5678
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={13} /> Mumbai, Maharashtra
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-custom mb-5">
                {title}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary hover:text-primary transition-colors duration-200"
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
              className="inline-flex items-center px-6 py-2.5 rounded-full bg-groove-gold text-black text-xs font-semibold tracking-wider uppercase hover:shadow-gold transition-all duration-300 hover:scale-105"
            >
              Enquire
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-custom">
          <span>© {new Date().getFullYear()} Groove Infra. All rights reserved.</span>
          <span>Crafted with precision in Mumbai, India.</span>
        </div>
      </div>
    </footer>
  )
}
