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

/**
 * Which frames run the full width: one wide, then two paired, repeating.
 *
 * The last frame is widened when it would otherwise sit alone in a two-up row.
 * A single portrait with an empty half-column beside it reads as a photograph
 * that failed to load rather than as a composition.
 */
function frameWidths(count: number): boolean[] {
  const widths = Array.from({ length: count }, (_, i) => i % 3 === 0)
  if (count % 3 === 2) widths[count - 1] = true
  return widths
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

  const widths = frameWidths(images.length)

  const controlClass =
    'inline-flex h-11 w-11 items-center justify-center bg-white/10 text-white transition-colors hover:bg-white/20'

  return (
    <>
      {/*
        A sequence rather than a uniform grid. Every third frame runs the full
        width of the column and the rest pair up, which is how a set of interior
        photographs is laid out in print: the wide shot establishes the room, the
        pair beside it are details. A grid of identical squares flattens that
        distinction and makes twelve photographs of one job look like twelve
        unrelated thumbnails.
      */}
      <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
        {images.map((image, i) => {
          const wide = widths[i]
          return (
            <li key={image.src ?? image.seed} className={wide ? 'sm:col-span-2' : undefined}>
              <motion.button
                type="button"
                onClick={() => setLightbox(i)}
                className={`group relative block w-full cursor-zoom-in overflow-hidden bg-surface-2 ${
                  wide ? 'aspect-[16/9]' : 'aspect-[4/5]'
                }`}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.25 }}
                aria-label={`Enlarge image ${i + 1} of ${images.length}`}
              >
                <motion.span
                  className="absolute inset-0 block"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.6 }}
                >
                  <ProjectImage
                    image={image}
                    alt={`${title} — image ${i + 1}`}
                    sizes={wide ? '(max-width: 640px) 100vw, 60rem' : '(max-width: 640px) 100vw, 30rem'}
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

              <p
                aria-hidden="true"
                className="nums-tabular mt-3 border-t border-subtle pt-3 text-micro uppercase tracking-eyebrow text-muted-custom"
              >
                Fig. {String(i + 1).padStart(2, '0')}
              </p>
            </li>
          )
        })}
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
