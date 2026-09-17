'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useBackdropClose, useDialog } from '@/lib/hooks/use-dialog'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const adminLink = { href: '/admin', label: 'Admin' }

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const [pastHero, setPastHero] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const pathname = usePathname()

  // Full-bleed photo heroes keep white chrome until the hero clears the header.
  const isPhotoHero =
    pathname === '/' || (pathname.startsWith('/projects/') && pathname !== '/projects')
  const overPhoto = isPhotoHero && !pastHero
  const links = showAdmin ? [...navLinks, adminLink] : navLinks

  const closeMenu = () => setMenuOpen(false)
  const dialogRef = useDialog({ open: menuOpen, onClose: closeMenu })
  const onBackdropClick = useBackdropClose(closeMenu)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Admin is never advertised publicly. The link appears only after a signed-in
  // session exists (reached by going to /admin/login directly).
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setShowAdmin(Boolean(data.authenticated))
      })
      .catch(() => {
        if (!cancelled) setShowAdmin(false)
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  useEffect(() => {
    if (!isPhotoHero) {
      setPastHero(true)
      return
    }

    setPastHero(false)

    const update = () => {
      const hero = document.querySelector<HTMLElement>('[data-photo-hero]')
      // Switch only once the hero's bottom edge has cleared the header band,
      // not after a few dozen pixels of scroll while the photo is still under it.
      const headerBand = 72
      if (hero) {
        setPastHero(hero.getBoundingClientRect().bottom <= headerBand)
        return
      }
      setPastHero(window.scrollY >= window.innerHeight - headerBand)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [isPhotoHero, pathname])

  return (
    <>
      <motion.header
        // Same marker the scroll-reveal sections carry, for the same two reasons:
        // the <noscript> rule in the root layout has to force it visible, and the
        // accessibility suite has to wait for its entrance to finish before
        // judging contrast — a half-faded gold button reports as a violation.
        data-animated-section=""
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          pastHero || !isPhotoHero
            ? 'border-b border-subtle bg-surface/90 py-3 backdrop-blur-xl'
            : 'border-b border-white/10 bg-black/35 py-5 backdrop-blur-xl supports-[backdrop-filter]:bg-black/25'
        )}
      >
        <div className="gutter relative mx-auto flex w-full max-w-[100rem] items-center justify-between">
          <Link href="/" className="group flex items-center gap-3" aria-label="Groove Infra — home">
            <span
              className="flex h-7 w-7 items-center justify-center bg-groove-gold"
              aria-hidden="true"
            >
              <span className="font-display text-xs font-bold text-black">G</span>
            </span>
            <span
              className={cn(
                'font-display text-base font-semibold uppercase tracking-widest transition-colors duration-300',
                overPhoto ? 'text-white' : 'text-primary'
              )}
            >
              Groove Infra
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
            {links.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group inline-flex min-h-11 items-center text-meta transition-colors duration-200',
                    active
                      ? overPhoto
                        ? 'text-groove-gold'
                        : 'text-accent-gold'
                      : overPhoto
                        ? 'text-white/85 hover:text-white'
                        : 'text-secondary hover:text-primary'
                  )}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-1 left-0 h-px bg-groove-gold transition-all duration-200',
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden min-h-11 items-center bg-groove-gold px-6 text-micro font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light md:inline-flex"
            >
              Enquire
            </Link>
            {/*
              The panel below renders above the header and carries its own close
              button, so this trigger only ever opens. It still reports
              aria-expanded, which is what tells a screen reader that the panel
              it controls is currently showing.
            */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                'md:hidden inline-flex h-11 w-11 items-center justify-center transition-colors',
                overPhoto
                  ? 'text-white/85 hover:text-white'
                  : 'text-secondary hover:text-primary'
              )}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label="Open menu"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onBackdropClick}
          >
            <motion.div
              id="mobile-navigation"
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              className="absolute top-0 left-0 right-0 bg-surface border-b border-subtle pb-10 px-6 pt-5"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-primary"
                  aria-label="Close menu"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Site" className="flex flex-col gap-2 pt-4">
                {links.map((link) => {
                  const active = isActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-11 items-center font-display text-h3 font-medium',
                        active ? 'text-accent-gold' : 'text-primary'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="pt-6 mt-4 border-t border-subtle">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center bg-groove-gold px-7 text-micro font-semibold uppercase tracking-eyebrow text-black"
                >
                  Enquire
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
