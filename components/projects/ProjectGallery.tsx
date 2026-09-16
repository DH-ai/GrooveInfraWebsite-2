'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useBackdropClose, useDialog } from '@/lib/hooks/use-dialog'
import type { ResolvedImage } from '@/lib/project-images'
import ProjectImage from '@/components/ui/ProjectImage'

interface ProjectGalleryProps {
  /** Resolved by the data layer, so entries may be drawn plates rather than photographs. */
  images: ResolvedImage[]
  title: string
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const isOpen = lightbox !== null

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const dialogRef = useDialog({ open: isOpen, onClose: closeLightbox })
  const onBackdropClick = useBackdropClose(closeLightbox)

  const step = useCallback(
    (delta: number) => {
      setLightbox((current) =>
        current === null ? null : (current + delta + images.length) % images.length
      )
    },
    [images.length]
  )

  // Arrow keys are the expected way to move through a set of images once the
  // dialog has focus; without them the only way through the gallery is to tab to
  // the previous/next buttons for every single image.
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, step])

  if (!images.length) return null

  const controlClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 list-none">
        {images.map((image, i) => (
          <li
            key={image.src ?? image.seed}
            className={i === 0 ? 'col-span-2 md:col-span-2' : undefined}
          >
            <motion.button
              type="button"
              onClick={() => setLightbox(i)}
              className={`group relative block w-full overflow-hidden rounded-xl bg-surface-2 cursor-zoom-in ${
                i === 0 ? 'aspect-[16/9]' : 'aspect-square'
              }`}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
              aria-label={`Enlarge image ${i + 1} of ${images.length}`}
            >
              <motion.span
                className="absolute inset-0 block"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <ProjectImage
                  image={image}
                  alt={`${title} — image ${i + 1}`}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </motion.span>
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
              >
                <ZoomIn
                  size={20}
                  className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>
            </motion.button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={onBackdropClick}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${title} — image gallery`}
              tabIndex={-1}
              className="relative flex h-full w-full items-center justify-center"
            >
              <button
                type="button"
                onClick={closeLightbox}
                className={`absolute right-4 top-4 z-10 ${controlClass}`}
                aria-label="Close gallery"
              >
                <X size={18} aria-hidden="true" />
              </button>

              {/*
                Politely announced so a screen reader user hears which image the
                gallery moved to after an arrow key, rather than having the
                picture swapped underneath them in silence.
              */}
              <p
                aria-live="polite"
                aria-atomic="true"
                className="absolute left-1/2 top-6 z-10 -translate-x-1/2 text-sm text-white/70"
              >
                Image {lightbox + 1} of {images.length}
              </p>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={`absolute left-4 top-1/2 z-10 -translate-y-1/2 ${controlClass}`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 ${controlClass}`}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={lightbox}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="relative mx-6 aspect-video w-full max-w-4xl"
                >
                  <ProjectImage
                    image={images[lightbox]}
                    alt={`${title} — image ${lightbox + 1} of ${images.length}`}
                    sizes="(max-width: 1200px) 100vw, 900px"
                    priority
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
