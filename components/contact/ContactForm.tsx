'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import TurnstileWidget from './TurnstileWidget'

const projectTypes = ['Retail', 'Hospitality & Clubs', 'Commercial', 'Residential', 'Civil', 'Other']

const MESSAGE_MAX = 5000

type Status = 'idle' | 'loading' | 'success' | 'error'

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors'
const errorInputClass =
  'w-full px-4 py-3 rounded-xl bg-surface-2 border border-red-500/60 text-primary placeholder:text-muted-custom text-sm focus:outline-none transition-colors'

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center text-center py-20"
      >
        <div className="w-16 h-16 rounded-full bg-groove-gold/10 flex items-center justify-center mb-6">
          <CheckCircle size={28} className="text-accent-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Message Sent!</h2>
        <p className="text-secondary max-w-xs">
          We&apos;ll review your request and get back to you within 24 business hours.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 text-sm font-medium text-accent-gold underline underline-offset-4 hover:text-primary transition-colors"
        >
          Send another message
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/*
        Honeypot. Hidden from sight and from assistive technology, and skipped in
        the tab order, so only an automated client will ever fill it in.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="botField" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-secondary mb-2">
            Your Name *
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
            <p id="name-error" className="mt-1.5 text-xs text-red-500">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="company" className="block text-xs font-medium text-secondary mb-2">
            Company / Brand
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-secondary mb-2">
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
            <p id="email-error" className="mt-1.5 text-xs text-red-500">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-secondary mb-2">
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

      {/* Project type pills */}
      <fieldset>
        <legend className="block text-xs font-medium text-secondary mb-2">Project Type</legend>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={projectType === t}
              onClick={() => setProjectType(t === projectType ? '' : t)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                projectType === t
                  ? 'bg-groove-gold text-black border-groove-gold'
                  : 'border-subtle text-secondary hover:border-groove-gold/40 hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="location" className="block text-xs font-medium text-secondary mb-2">
          City / Location
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
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="message" className="block text-xs font-medium text-secondary">
            Tell Us About Your Project *
          </label>
          {messageLength > MESSAGE_MAX * 0.8 && (
            <span
              className={`text-[11px] ${
                messageLength > MESSAGE_MAX ? 'text-red-500' : 'text-muted-custom'
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
          <p id="message-error" className="mt-1.5 text-xs text-red-500">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <TurnstileWidget onToken={handleToken} resetKey={turnstileResetKey} />

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            {errorMessage ?? 'Something went wrong. Please try again or email us directly.'}
          </span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  )
}
