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

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setMenuOpen(false)
  const dialogRef = useDialog({ open: menuOpen, onClose: closeMenu })
  const onBackdropClick = useBackdropClose(closeMenu)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'py-3 bg-surface/80 backdrop-blur-xl border-b border-subtle'
            : 'py-5 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Groove Infra — home">
            <span
              className="w-7 h-7 rounded-sm bg-groove-gold flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-black font-display font-bold text-xs">G</span>
            </span>
            <span className="font-display font-semibold text-base tracking-widest uppercase text-primary">
              Groove Infra
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group inline-flex min-h-11 items-center text-sm tracking-wide transition-colors duration-200',
                    active ? 'text-accent-gold' : 'text-secondary hover:text-primary'
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
              className="hidden md:inline-flex min-h-11 items-center px-5 rounded-full bg-groove-gold text-black text-xs font-semibold tracking-wider uppercase transition-opacity duration-300 hover:opacity-85"
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
              className="md:hidden inline-flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-primary"
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
                  aria-label="Close menu"
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Site" className="flex flex-col gap-2 pt-4">
                {navLinks.map((link) => {
                  const active = isActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-11 items-center text-2xl font-display font-medium',
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
                  className="inline-flex min-h-11 items-center px-7 rounded-full bg-groove-gold text-black text-sm font-semibold tracking-wide uppercase"
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
