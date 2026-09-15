'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'What types of projects does Groove Infra undertake?',
    a: 'We specialise in retail fit-outs, commercial interiors (offices, clinics, showrooms), hospitality spaces (restaurants, hotels, clubs), residential makeovers, and civil construction across India.',
  },
  {
    q: 'How long does a typical interior project take?',
    a: 'Project timelines depend on scope and size. A single retail store typically takes 8–14 weeks; a mid-sized corporate office takes 16–24 weeks; large hospitality and residential projects can run 20–36 weeks. We provide a detailed timeline at project kickoff.',
  },
  // {
  //   q: 'Do you work outside Mumbai?',
  //   a: 'Yes — we operate in Delhi, Gurgaon, Noida, Jaipur, Mumbai, Hyderabad, Bangalore, and Goa. We also handle nationwide rollouts for retail chains across 50+ cities.',
  // },
  {
    q: 'What is the minimum project budget you work with?',
    a: 'Our minimum engagement is ₹20 lakhs for interior fit-outs. For nationwide rollouts, the aggregate budget is considered rather than per-store spend. Contact us and we\'ll advise on feasibility.',
  },
  {
    q: 'Do you provide design services, or just construction?',
    a: 'We provide fully integrated design-and-build services — from concept and space planning through to on-site construction and handover. You work with one team throughout, ensuring design intent is perfectly executed.',
  },
  // {
  //   q: 'What warranties do you offer after handover?',
  //   a: 'All Groove Infra projects come with a standard 12-month warranty covering material defects and workmanship issues. For specific finishes and systems (AV, smart home), extended manufacturer warranties apply.',
  // },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-subtle">
      {faqs.map((faq, i) => {
        const expanded = open === i
        const panelId = `faq-panel-${i}`
        const buttonId = `faq-button-${i}`

        return (
          <div key={faq.q}>
            {/*
              The heading wraps the button rather than the other way round. That
              keeps each question in the document outline, so screen-reader users
              can jump between questions with heading navigation, while the button
              remains the thing that is actually operable.
            */}
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
                className="group flex w-full min-h-11 items-center justify-between gap-4 py-5 text-left"
              >
                <span
                  className={`font-medium text-sm sm:text-base transition-colors duration-200 ${
                    expanded ? 'text-accent-gold' : 'text-primary group-hover:text-accent-gold'
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-strong text-secondary"
                >
                  {expanded ? <Minus size={12} /> : <Plus size={12} />}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-5 text-sm leading-relaxed text-secondary">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
