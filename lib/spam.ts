/**
 * Cheap heuristics that run before Turnstile, catching the bulk of unsophisticated
 * form spam without any network round trip.
 */

/** A human cannot read the form and fill it in faster than this. */
export const MIN_SUBMIT_SECONDS = 2

/** Guards against a stale or forged timestamp being replayed for hours. */
const MAX_FORM_AGE_SECONDS = 60 * 60 * 12

interface SpamSignals {
  botField?: string
  renderedAt?: number
}

export type SpamVerdict =
  | { spam: false }
  | { spam: true; signal: 'honeypot' | 'too-fast' | 'stale-form' }

export function detectSpam({ botField, renderedAt }: SpamSignals): SpamVerdict {
  // Hidden field, invisible to real users; bots fill in everything they find.
  if (botField && botField.trim().length > 0) return { spam: true, signal: 'honeypot' }

  if (typeof renderedAt === 'number' && renderedAt > 0) {
    const elapsedSeconds = (Date.now() - renderedAt) / 1000
    if (elapsedSeconds < MIN_SUBMIT_SECONDS) return { spam: true, signal: 'too-fast' }
    if (elapsedSeconds > MAX_FORM_AGE_SECONDS) return { spam: true, signal: 'stale-form' }
  }

  return { spam: false }
}
