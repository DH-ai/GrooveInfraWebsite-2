/**
 * The shared look of every control on the site.
 *
 * The public form and the two admin forms each carried their own copy of these
 * class strings, so the contact page ended up with 14px rounded inputs on one
 * surface and the CMS with 11px-tall rounded inputs on another. Anything that is
 * typed into now looks the same wherever it appears.
 *
 * `border-strong` rather than `border-subtle`: the border is what identifies a
 * control as a control, and it has to clear WCAG 1.4.11's 3:1 for non-text UI.
 * `border-subtle` sits at 1.3:1 and reads as no border at all. The native focus
 * outline is never suppressed on any of these.
 */

/** Small caps, sitting above its control. */
export const fieldLabelClass = 'block text-micro uppercase tracking-eyebrow text-muted-custom'

/** For labels that wrap their control, which is the pattern the admin forms use. */
export const fieldLabelStackClass = `flex flex-col gap-3 ${fieldLabelClass}`

const fieldBase =
  'w-full bg-surface px-4 text-body text-primary placeholder:text-muted-custom transition-colors'

/** Body-size text: a 14px input makes iOS zoom the viewport when it takes focus. */
export const fieldInputClass = `${fieldBase} h-12 border border-strong hover:border-groove-gold/60`

export const fieldSelectClass = fieldInputClass

export const fieldTextareaClass = `${fieldBase} py-3.5 border border-strong hover:border-groove-gold/60`

/** The invalid state of `fieldInputClass`, paired with an `aria-describedby` message. */
export const fieldErrorInputClass = `${fieldBase} h-12 border border-red-400`

export const filePickerClass =
  'text-body text-secondary file:mr-4 file:border-0 file:bg-groove-gold file:px-5 file:py-2.5 file:text-meta file:font-semibold file:uppercase file:tracking-eyebrow file:text-black'

/** Square, gold, and only as wide as its label. */
export const primaryButtonClass =
  'inline-flex min-h-11 items-center gap-3 bg-groove-gold px-8 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light disabled:cursor-not-allowed disabled:opacity-60'

/** The secondary action: a ruled label, the same device the header uses. */
export const quietButtonClass =
  'inline-flex min-h-11 items-center underline decoration-1 underline-offset-[7px] decoration-strong text-meta font-medium uppercase tracking-eyebrow text-primary transition-colors hover:decoration-groove-gold hover:text-accent-gold disabled:cursor-not-allowed disabled:opacity-60'

/** For the dense rows of actions in the CMS, where a full-size button would not fit. */
export const chipButtonClass =
  'inline-flex min-h-11 items-center border border-strong px-4 text-micro uppercase tracking-eyebrow text-secondary transition-colors hover:border-groove-gold hover:text-primary'

export const dangerChipButtonClass =
  'inline-flex min-h-11 items-center border border-red-400/60 px-4 text-micro uppercase tracking-eyebrow text-red-200 transition-colors hover:border-red-400 hover:text-red-100'
