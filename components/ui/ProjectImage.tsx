import Image from 'next/image'
import { placeholderArt } from '@/lib/placeholder-art'
import type { ResolvedImage } from '@/lib/project-images'
import { cn } from '@/lib/utils'

/**
 * The only place in the app that knows a project image might not be a
 * photograph. Callers hand it a `ResolvedImage` from `project.imagery` and get
 * something that fills the frame either way, so no page has to branch on whether
 * the client has uploaded yet.
 *
 * Not a client component: there is no state or effect here, and keeping it on the
 * server means a grid of twenty cards ships no JavaScript for its imagery.
 */

interface ProjectImageProps {
  image: ResolvedImage
  /**
   * Describes the photograph. Ignored for a placeholder, which is abstract art
   * and therefore decorative: announcing "Prestige Retail, Gurgaon" over a
   * drawn plate would tell a screen-reader user about a photograph that is not
   * there. The surrounding markup always carries the project name as real text.
   */
  alt: string
  /** Required for owned photography — a wrong `sizes` is the usual cause of an oversized LCP. */
  sizes: string
  priority?: boolean
  className?: string
  /**
   * Optional caption for large plates, where an unbroken tonal field reads as
   * empty. Rendered as real text rather than baked into the art so it inherits
   * the site's fonts and can be read out.
   */
  label?: string
}

export default function ProjectImage({
  image,
  alt,
  sizes,
  priority = false,
  className,
  label,
}: ProjectImageProps) {
  if (!image.isPlaceholder && image.src) {
    return (
      <Image
        src={image.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn('object-cover', className)}
      />
    )
  }

  const art = placeholderArt(image.seed)

  return (
    <div
      /*
       * `presentation` rather than `img` with an alt: this is a generated tonal
       * field, so there is no image content to describe. It is removed from the
       * accessibility tree entirely and the label below, when present, is left in
       * it as ordinary text.
       */
      role="presentation"
      data-placeholder="true"
      data-motif={art.motif}
      className={cn('absolute inset-0', className)}
      style={{ backgroundImage: art.backgroundImage }}
    >
      {label && (
        /*
         * 70% rather than the 45% this started at. axe cannot measure contrast
         * against a CSS background-image, so it reported nothing either way; the
         * plate's gold bloom lifts the field to about #2a2419 at its brightest,
         * where white at 45% lands on 4.27:1 and fails the 4.5:1 that 10px text
         * needs. At 70% the worst point on any plate is 8.2:1.
         */
        <span className="absolute bottom-4 left-4 right-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
          {label}
        </span>
      )}
    </div>
  )
}
