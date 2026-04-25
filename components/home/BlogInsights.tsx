'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const articles = [
  {
    title: 'How to Design Your Home Using AI',
    slug: '#',
    category: 'Technology',
    date: 'Apr 2025',
    reading_time: '5 min',
    description:
      'Artificial intelligence is changing the way homeowners plan and visualize interiors before a single wall is touched. Here\'s how to use it effectively.',
    cover_image: 'https://picsum.photos/seed/blog-ai-home/800/500',
  },
  {
    title: 'The Hidden Cost of a Bad Retail Fit-Out',
    slug: '#',
    category: 'Retail',
    date: 'Mar 2025',
    reading_time: '4 min',
    description:
      'Poor interior execution costs brands more than just aesthetics — it directly impacts dwell time, conversion, and repeat visits. Here\'s what to watch out for.',
    cover_image: 'https://picsum.photos/seed/blog-retail/800/500',
  },
  {
    title: 'Biophilic Design in Modern Offices',
    slug: '#',
    category: 'Commercial',
    date: 'Feb 2025',
    reading_time: '6 min',
    description:
      'Bringing nature indoors isn\'t just a design trend — it\'s a measurable strategy for improving productivity, reducing absenteeism, and attracting talent.',
    cover_image: 'https://picsum.photos/seed/blog-biophilic/800/500',
  },
]

export default function BlogInsights() {
  return (
    <section className="py-28 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end gap-6 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                Latest Insights
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary">
              Ideas &amp; Perspectives
            </h2>
          </div>
          <Link
            href="#"
            className="group inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors self-start sm:self-auto pb-1"
          >
            All articles
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <AnimatedSection key={article.title} delay={i * 0.08}>
              <Link href={article.slug} className="group block">
                {/* Image */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-surface-2">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </motion.div>
                  {/* Category pill */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/90">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-custom mb-3">
                  <span>{article.date}</span>
                  <span>·</span>
                  <Clock size={10} />
                  <span>{article.reading_time} read</span>
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-primary text-xl leading-snug mb-2 group-hover:text-accent-gold transition-colors duration-300">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                  {article.description}
                </p>

                {/* Read more */}
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Read article
                  <ArrowRight size={12} />
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
