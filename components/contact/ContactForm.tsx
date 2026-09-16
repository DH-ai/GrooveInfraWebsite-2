'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import TurnstileWidget from './TurnstileWidget'

const projectTypes = ['Retail', 'Hospitality & Clubs', 'Commercial', 'Residential', 'Civil', 'Other']

const MESSAGE_MAX = 5000

type Status = 'idle' | 'loading' | 'success' | 'error'

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

// The border is what makes these controls identifiable as controls, so it uses
// border-strong to clear WCAG 1.4.11's 3:1 for non-text UI; border-subtle sits at
// 1.3:1 against the page and reads as no border at all. The native focus outline
// is deliberately not suppressed — a 50%-opacity border change was the only focus
// signal before, which is neither thick enough nor high-contrast enough to see.
//
// Square, and set at body size. Rounded corners were the only thing on the page
// with a radius, and a 14px input is small enough that iOS zooms the viewport
// when it takes focus.
const baseInputClass =
  'mt-3 w-full bg-surface px-4 py-3.5 text-body text-primary placeholder:text-muted-custom transition-colors'
const inputClass = `${baseInputClass} border border-strong hover:border-groove-gold/60`
const errorInputClass = `${baseInputClass} border border-red-400`

const labelClass = 'block text-micro uppercase tracking-eyebrow text-muted-custom'

// Deliberately permissive: the server is the authority on validity, this only
// catches obvious typos before a round trip.
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [projectType, setProjectType] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [messageLength, setMessageLength] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  // Used server-side to reject submissions that arrive faster than a human could
  // fill the form in. Set after mount so it reflects the real render time.
  const renderedAtRef = useRef(0)
  useEffect(() => {
    renderedAtRef.current = Date.now()
  }, [])

  const handleToken = useCallback((token: string) => setTurnstileToken(token), [])

  function validate(data: Record<string, string>): FieldErrors {
    const errors: FieldErrors = {}
    if (!data.name?.trim()) errors.name = 'Please tell us your name.'
    if (!data.email?.trim()) errors.email = 'Please enter your email.'
    else if (!looksLikeEmail(data.email.trim())) errors.email = 'Enter a valid email address.'
    if (!data.message?.trim()) errors.message = 'Please tell us about your project.'
    else if (data.message.length > MESSAGE_MAX) {
      errors.message = `Please keep it under ${MESSAGE_MAX.toLocaleString()} characters.`
    }
    return errors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    const errors = validate(data)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setStatus('idle')
      setErrorMessage(null)
      // Without this the message appears next to a field that may be off-screen
      // and the keyboard user is left on the submit button with no indication of
      // what went wrong.
      const firstInvalid = (['name', 'email', 'message'] as const).find((field) => errors[field])
      if (firstInvalid) {
        form.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus()
      }
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          projectType,
          renderedAt: renderedAtRef.current,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMessage(payload.error ?? null)
        setStatus('error')
        // Turnstile tokens are single-use, so the widget must be re-issued.
        setTurnstileResetKey((k) => k + 1)
        setTurnstileToken('')
        return
      }

      setStatus('success')
    } catch {
      setErrorMessage(null)
      setStatus('error')
      setTurnstileResetKey((k) => k + 1)
      setTurnstileToken('')
    }
  }

  function resetForm() {
    setStatus('idle')
    setProjectType('')
    setErrorMessage(null)
    setFieldErrors({})
    setMessageLength(0)
    setTurnstileToken('')
    setTurnstileResetKey((k) => k + 1)
    renderedAtRef.current = Date.now()
  }

  if (status === 'success') {
    return (
      <motion.div
        // Submitting removes the form, and with it the button that had focus.
        // Focus would otherwise fall back to <body>, so the confirmation panel
        // takes it and is announced as a status region.
        ref={(node) => node?.focus()}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        className="border-t border-strong py-14"
      >
        <p className="text-micro uppercase tracking-eyebrow text-accent-gold">Received</p>
        <h2 className="mt-6 max-w-[24ch] font-display text-h3 font-semibold text-primary">
          Your enquiry is with us.
        </h2>
        <p className="measure mt-5 text-body text-secondary">
          We read every one. Expect a reply within 24 business hours — sooner if the date is tight.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-8 inline-flex min-h-11 items-center border-b border-strong pb-1 text-meta font-medium uppercase tracking-eyebrow text-primary transition-colors hover:border-groove-gold hover:text-accent-gold"
        >
          Send another
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/*
        Honeypot. Hidden from sight and from assistive technology, and skipped in
        the tab order, so only an automated client will ever fill it in.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="botField" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Your name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            placeholder="Rahul Sharma"
            className={fieldErrors.name ? errorInputClass : inputClass}
          />
          {fieldErrors.name && (
            <p id="name-error" className="mt-2 text-meta text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>
            Company or brand
          </label>
          <input
            id="company"
            name="company"
            type="text"
            maxLength={160}
            autoComplete="organization"
            placeholder="Acme Retail Pvt Ltd"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            placeholder="rahul@company.com"
            className={fieldErrors.email ? errorInputClass : inputClass}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-2 text-meta text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Project type</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {projectTypes.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={projectType === t}
              onClick={() => setProjectType(t === projectType ? '' : t)}
              /*
               * Square, and filled when chosen. The underline the portfolio
               * filter uses is right for a control that acts on the page
               * immediately; in a form, a selection that has to survive until
               * submit needs to be unmistakable.
               */
              className={`inline-flex min-h-11 items-center border px-4 text-meta transition-colors duration-200 ${
                projectType === t
                  ? 'border-groove-gold bg-groove-gold font-medium text-black'
                  : 'border-strong text-secondary hover:border-groove-gold/60 hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="location" className={labelClass}>
          City or location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          maxLength={120}
          placeholder="Mumbai, Delhi, Bangalore..."
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="message" className={labelClass}>
            The project *
          </label>
          {messageLength > MESSAGE_MAX * 0.8 && (
            <span
              className={`nums-tabular text-micro ${
                messageLength > MESSAGE_MAX ? 'text-red-400' : 'text-muted-custom'
              }`}
            >
              {messageLength.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
            </span>
          )}
        </div>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={MESSAGE_MAX}
          onChange={(e) => setMessageLength(e.target.value.length)}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          placeholder="Share your vision, timeline, approximate budget, and any specific requirements..."
          className={`${fieldErrors.message ? errorInputClass : inputClass} resize-none`}
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-2 text-meta text-red-400">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <TurnstileWidget onToken={handleToken} resetKey={turnstileResetKey} />

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          // role="alert" already implies an assertive live region; pairing it
          // with aria-live="polite" leaves the two contradicting each other.
          role="alert"
          className="flex items-start gap-3 border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-body text-red-400"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {errorMessage ?? 'Something went wrong. Please try again or email us directly.'}
          </span>
        </motion.div>
      )}

      {/*
        Square, and only as wide as it needs to be. A full-width pill that grew
        on hover was the largest element on the page and read as a banner rather
        than as the end of a form.
      */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex min-h-11 items-center gap-3 bg-groove-gold px-8 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Sending
          </>
        ) : (
          'Send enquiry'
        )}
      </button>
    </form>
  )
}
