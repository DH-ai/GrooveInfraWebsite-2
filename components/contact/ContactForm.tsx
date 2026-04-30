'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const projectTypes = ['Retail', 'Hospitality & Clubs', 'Commercial', 'Residential', 'Civil', 'Other']

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [projectType, setProjectType] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectType }),
      })

      if (!res.ok) throw new Error('send failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-20"
      >
        <div className="w-16 h-16 rounded-full bg-groove-gold/10 flex items-center justify-center mb-6">
          <CheckCircle size={28} className="text-accent-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Message Sent!</h2>
        <p className="text-secondary max-w-xs">
          We&apos;ll review your request and get back to you within 24 business hours.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Rahul Sharma"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-xs font-medium text-secondary mb-2">
            Company / Brand
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="Acme Retail Pvt Ltd"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
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
            placeholder="rahul@company.com"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-secondary mb-2">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Project type pills */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Project Type</label>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((t) => (
            <button
              key={t}
              type="button"
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
      </div>

      <div>
        <label htmlFor="location" className="block text-xs font-medium text-secondary mb-2">
          City / Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="Mumbai, Delhi, Bangalore..."
          className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-secondary mb-2">
          Tell Us About Your Project *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Share your vision, timeline, approximate budget, and any specific requirements..."
          className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors resize-none"
        />
      </div>

      {/* Error state */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <AlertCircle size={15} />
          Something went wrong. Please try again or email us directly.
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
