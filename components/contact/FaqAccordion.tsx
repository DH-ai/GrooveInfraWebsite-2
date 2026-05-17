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
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-4 group"
          >
            <span className={`font-medium text-sm sm:text-base transition-colors duration-200 ${open === i ? 'text-accent-gold' : 'text-primary group-hover:text-accent-gold'}`}>
              {faq.q}
            </span>
            <span className="flex-shrink-0 w-6 h-6 rounded-full border border-subtle flex items-center justify-center text-secondary">
              {open === i ? <Minus size={12} /> : <Plus size={12} />}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <p className="text-secondary text-sm leading-relaxed pb-5 max-w-2xl">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
