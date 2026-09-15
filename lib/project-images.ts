import { isAllowedImageUrl } from '@/lib/supabase-storage'

/**
 * Decides, once, which imagery a project actually shows.
 *
 * The client has the photography but has not uploaded it. Until they do, every
 * image-bearing surface needs something to render, and the swap has to happen by
 * uploading a file — not by editing code, a database default, or a per-component
 * conditional. So the decision lives here, in the data layer, and
 * `rowToProject` attaches the result to every project. Components read
 * `project.imagery` and never ask where an image came from.
 *
 * "Owned" means "served from our own Supabase bucket". That is the same
 * predicate the admin write path already enforces via `isAllowedImageUrl`, so
 * the read and write sides finally agree on one definition. It also means the
 * legacy stock URLs sitting in the projects table are ignored on sight, with no
 * migration and no cleanup script: they are not under our prefix, so they are
 * not photography of our work.
 */

export interface ResolvedImage {
  /**
   * Null for a placeholder. A placeholder has no URL because it is drawn from
   * CSS rather than fetched, which is what lets it be byte-free and exactly the
   * right aspect ratio.
   */
  src: string | null
  isPlaceholder: boolean
  /** Stable input to `placeholderArt`, so a plate never changes between renders. */
  seed: string
}

export interface ProjectImagery {
  cover: ResolvedImage
  /** Never empty: a project with no owned images still gets plates to show. */
  gallery: ResolvedImage[]
  /** False when every plate is drawn — the flag admin and the carousel key off. */
  hasOwnPhotography: boolean
  ownedCount: number
}

/**
 * How many plates to invent for a project with nothing uploaded. Enough that a
 * gallery looks composed rather than broken, few enough that it never pretends
 * to be a full photographic record.
 */
const PLACEHOLDER_GALLERY_SIZE = 3

interface ImageSource {
  slug: string
  cover_image?: string
  images: string[]
}

function owned(urls: Array<string | undefined>): string[] {
  return urls.filter((url): url is string => Boolean(url) && isAllowedImageUrl(url as string))
}

export function resolveProjectImagery(project: ImageSource): ProjectImagery {
  const { slug } = project

  /*
   * cover_image first so an explicitly chosen cover wins, then the gallery in
   * order. Deduplicated because the cover is conventionally also the first
   * gallery image, and showing it twice in the lightbox looks like a bug.
   */
  const ownedImages = Array.from(new Set(owned([project.cover_image, ...project.images])))

  if (ownedImages.length > 0) {
    /*
     * Deliberately no padding with plates when only some images are uploaded.
     * Mixing drawn plates into a gallery of real site photography would read as
     * missing photos, and it would put invented imagery inside a sequence the
     * viewer is being invited to read as a record of the finished space. Partial
     * upload shows exactly what exists.
     */
    return {
      cover: { src: ownedImages[0], isPlaceholder: false, seed: slug },
      gallery: ownedImages.map((src) => ({ src, isPlaceholder: false, seed: slug })),
      hasOwnPhotography: true,
      ownedCount: ownedImages.length,
    }
  }

  const cover: ResolvedImage = { src: null, isPlaceholder: true, seed: slug }

  return {
    cover,
    /*
     * The cover's own seed leads the gallery so the first plate a visitor sees on
     * the detail page is the one they clicked on the index, then the suffixed
     * seeds give the rest a different tone and motif.
     */
    gallery: [
      cover,
      ...Array.from({ length: PLACEHOLDER_GALLERY_SIZE - 1 }, (_, i) => ({
        src: null,
        isPlaceholder: true,
        seed: `${slug}-${i + 1}`,
      })),
    ],
    hasOwnPhotography: false,
    ownedCount: 0,
  }
}
