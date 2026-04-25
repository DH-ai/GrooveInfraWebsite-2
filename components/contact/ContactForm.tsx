'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'

const projectTypes = ['Retail', 'Hospitality & Clubs', 'Commercial', 'Residential', 'Civil', 'Other']

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [type, setType] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
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
          <label className="block text-xs font-medium text-secondary mb-2">Your Name *</label>
          <input
            type="text"
            required
            placeholder="Rahul Sharma"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary mb-2">Company / Brand</label>
          <input
            type="text"
            placeholder="Acme Retail Pvt Ltd"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-secondary mb-2">Email *</label>
          <input
            type="email"
            required
            placeholder="rahul@company.com"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary mb-2">Phone</label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Project Type</label>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                type === t
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
        <label className="block text-xs font-medium text-secondary mb-2">City / Location</label>
        <input
          type="text"
          placeholder="Mumbai, Delhi, Bangalore..."
          className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Tell Us About Your Project *</label>
        <textarea
          required
          rows={5}
          placeholder="Share your vision, timeline, approximate budget, and any specific requirements..."
          className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-subtle text-primary placeholder:text-muted-custom text-sm focus:outline-none focus:border-groove-gold/50 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold transition-all duration-300 hover:scale-[1.02]"
      >
        Send Message
        <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  )
}
