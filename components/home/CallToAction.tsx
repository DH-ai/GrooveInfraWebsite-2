'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function CallToAction() {
  return (
    <section className="py-32 bg-base overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-groove-dark via-groove-black to-groove-black dark:from-groove-dark dark:to-groove-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.06),transparent_60%)]" />

            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-groove-gold/10" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Content */}
            <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-groove-gold/25 text-groove-gold text-xs font-medium tracking-widest uppercase mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-groove-gold animate-pulse" />
                Let&apos;s Build Together
              </motion.div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl mx-auto">
                Have a Space to{' '}
                <span className="text-gradient-gold">Transform?</span>
              </h2>

              <p className="text-white/60 text-lg max-w-md mx-auto mb-10">
                Share your vision and we&apos;ll handle everything — from design to delivery.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-groove-gold text-black font-medium hover:shadow-gold-hover transition-all duration-300 hover:scale-105"
                >
                  Start a Conversation
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/80 hover:border-white/30 hover:text-white transition-all duration-300"
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
