'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProjectGalleryProps {
  images: string[]
  title: string
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!images.length) return null

  function openLightbox(i: number) {
    setLightbox(i)
  }

  function closeLightbox() {
    setLightbox(null)
  }

  function prev() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + images.length) % images.length)
  }

  function next() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % images.length)
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <motion.button
            key={i}
            onClick={() => openLightbox(i)}
            className={`group relative overflow-hidden rounded-xl bg-surface-2 cursor-zoom-in ${
              i === 0 ? 'col-span-2 md:col-span-2 aspect-[16/9]' : 'aspect-square'
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn
                size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm z-10">
              {lightbox + 1} / {images.length}
            </div>

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightbox}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-4xl mx-6 aspect-video"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={images[lightbox]}
                  alt={`${title} — ${lightbox + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 900px"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
