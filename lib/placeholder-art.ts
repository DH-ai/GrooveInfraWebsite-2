/**
 * Deterministic cover art for projects that have no owned photography yet.
 *
 * The site previously filled these gaps with hotlinked stock photographs from
 * images.unsplash.com and picsum.photos. That was wrong on three counts: a
 * project page states a client name and says we built the space, so borrowed
 * photography of somebody else's store is a claim we cannot support; the images
 * came from third-party hosts, which forced `img-src https:` in the CSP; and the
 * URLs were written into the database, so replacing them meant editing rows
 * rather than uploading a file.
 *
 * The replacement is drawn rather than photographed. Each plate is a tonal field
 * with a hairline motif borrowed from construction drawings — plan grids, section
 * hatching, setting-out lines, a reveal joint — so an unphotographed project
 * reads as deliberate art direction instead of a missing asset. It costs no
 * bytes, needs no licence, and is generated from the project's own slug, so a
 * given project keeps the same plate across renders, revalidations and machines.
 *
 * Everything here is a pure function of the seed. No I/O, no randomness, no
 * date, so server and client agree and hydration is stable.
 */

const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

/**
 * FNV-1a, 32-bit. Chosen over anything cryptographic because this only needs to
 * spread short slugs evenly across a handful of buckets, and it has to produce
 * identical output in Node and in the browser without pulling in a dependency.
 */
function hash(seed: string): number {
  let h = FNV_OFFSET_BASIS
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, FNV_PRIME)
  }
  return h >>> 0
}

/** Pulls an independent small integer out of one hash by shifting past used bits. */
function pick(h: number, shift: number, modulo: number): number {
  return ((h >>> shift) % modulo + modulo) % modulo
}

/**
 * Deep, desaturated pairs only. A placeholder sits in a grid beside real
 * photography, so it has to recede; anything with real chroma would read as the
 * loudest thing on the page. Each pair keeps a slight temperature bias — warm
 * umbers and cool slates alternate — so a grid of plates does not look flat.
 */
const TONES: ReadonlyArray<{ from: string; to: string }> = [
  { from: '#0b0b0c', to: '#191713' },
  { from: '#0a0b0c', to: '#15181b' },
  { from: '#0c0a08', to: '#1c1710' },
  { from: '#090a0a', to: '#141719' },
  { from: '#0b0908', to: '#1a1512' },
  { from: '#0a0a0b', to: '#171514' },
]

export type PlaceholderMotif = 'plan' | 'section' | 'hatch' | 'reveal'

const MOTIFS: readonly PlaceholderMotif[] = ['plan', 'section', 'hatch', 'reveal']

/**
 * Hairlines are held at 4–6% opacity. They should be legible as a texture at
 * card size without competing with the caption laid over them, and the contrast
 * of the overlaid text is guaranteed by the scrim in ProjectImage rather than by
 * keeping these light.
 */
const MOTIF_LAYERS: Record<PlaceholderMotif, string> = {
  // Setting-out grid, as it appears on a floor plan.
  plan: [
    'repeating-linear-gradient(90deg, rgba(201,168,76,0.055) 0 1px, transparent 1px 72px)',
    'repeating-linear-gradient(0deg, rgba(201,168,76,0.055) 0 1px, transparent 1px 72px)',
  ].join(', '),
  // Close vertical ruling, the way a slatted or fluted elevation is drawn.
  section: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 26px)',
  // Diagonal poché, the hatch that marks cut material in a section drawing.
  hatch: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 14px)',
  // Widely spaced horizontals standing in for a shadow-gap reveal.
  reveal: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.055) 0 1px, transparent 1px 96px)',
}

export interface PlaceholderArt {
  /** Ready for `style={{ backgroundImage }}`; layers are ordered front to back. */
  backgroundImage: string
  /** Exposed so tests and the admin badge can assert which plate was chosen. */
  motif: PlaceholderMotif
}

/**
 * `seed` should be something stable and unique per plate — a slug, or a slug and
 * an index for the several plates of one gallery.
 */
export function placeholderArt(seed: string): PlaceholderArt {
  const h = hash(seed)

  const tone = TONES[pick(h, 0, TONES.length)]
  const motif = MOTIFS[pick(h, 5, MOTIFS.length)]

  // Off-axis so the field has a direction, but never diagonal enough to fight
  // the motif's own geometry.
  const angle = 100 + pick(h, 9, 8) * 10

  // An off-centre warm bloom, as if light were falling in from one side. Kept
  // away from the edges so it does not read as a rendering seam.
  const glowX = 22 + pick(h, 14, 6) * 10
  const glowY = 18 + pick(h, 19, 5) * 12

  const backgroundImage = [
    `radial-gradient(58% 48% at ${glowX}% ${glowY}%, rgba(201,168,76,0.10), transparent 70%)`,
    MOTIF_LAYERS[motif],
    `linear-gradient(${angle}deg, ${tone.from}, ${tone.to})`,
  ].join(', ')

  return { backgroundImage, motif }
}
