'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const isHeroPage = pathname === '/'

  // On the hero page the left panel is dark navy — text should always be white.
  const lightText = isHeroPage && !scrolled

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'py-3 bg-surface/90 backdrop-blur-xl border-b border-subtle'
            : 'py-5 bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-1 flex-none group">
            <span
              className={cn(
                'font-display font-bold text-xl tracking-[0.08em] uppercase transition-colors duration-300',
                lightText ? 'text-white' : 'text-primary'
              )}
            >
              Groove
            </span>
            <span className="font-display font-bold text-xl text-groove-copper group-hover:scale-110 transition-transform duration-200">
              .
            </span>
          </Link>

          {/* Nav — absolutely centered */}
          <nav className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm tracking-wide transition-colors duration-200 relative group',
                    active
                      ? 'text-groove-copper'
                      : lightText
                      ? 'text-white/75 hover:text-white'
                      : 'text-secondary hover:text-primary'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-groove-copper transition-all duration-200',
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/contact"
              className={cn(
                'hidden md:inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider transition-all duration-200',
                lightText
                  ? 'text-white/75 hover:text-white'
                  : 'text-secondary hover:text-groove-copper'
              )}
            >
              Start a Project
              <ArrowUpRight size={12} />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'md:hidden p-2 transition-colors',
                lightText ? 'text-white/80 hover:text-white' : 'text-secondary hover:text-primary'
              )}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="absolute top-0 left-0 right-0 bg-surface border-b border-subtle pt-24 pb-10 px-6"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'text-2xl font-display font-medium',
                        pathname === link.href ? 'text-groove-copper' : 'text-primary'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32 }}
                  className="pt-4 border-t border-subtle"
                >
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-groove-copper text-white text-sm font-semibold tracking-wide uppercase"
                  >
                    Start a Project
                    <ArrowUpRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
