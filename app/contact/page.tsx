import type { Metadata } from 'next'
import { Mail, Phone, MapPin } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import ContactForm from '@/components/contact/ContactForm'
import FaqAccordion from '@/components/contact/FaqAccordion'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Start your interior construction project with Groove Infra. Get in touch with our team for a personalized consultation.",
}

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contactus@grooveinfra.in',
    href: 'mailto:contactus@grooveinfra.in',
  },
  { icon: Phone, label: 'Phone', value: '+91 88003 85198', href: 'tel:+918800385198' },
  {
    icon: MapPin,
    label: 'Office',
    value:
      'Plot No-416/2, Metro Pillar No-127, Mehrauli-Gurgaon Rd, Ghitorni, New Delhi, Delhi 110030',
    href: 'https://www.google.com/maps/search/?api=1&query=Plot+No-416%2F2%2C+Metro+Pillar+No-127%2C+Mehrauli-Gurgaon+Rd%2C+Ghitorni%2C+New+Delhi%2C+Delhi+110030',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-base pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <AnimatedSection className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-groove-gold" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
              Let&apos;s Talk
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary leading-tight">
            Let&apos;s Start
            <br />
            Your Project
          </h1>
          <p className="text-secondary text-lg mt-4 max-w-md">
            Get in touch with our team to discuss your commercial interior needs and receive a
            personalised consultation.
          </p>
        </AnimatedSection>

        {/* Form + info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-28">
          {/* Form */}
          <AnimatedSection className="lg:col-span-3">
            <ContactForm />
          </AnimatedSection>

          {/* Contact info */}
          <AnimatedSection delay={0.1} className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-4 p-4 rounded-xl bg-surface-2 border border-subtle hover:border-groove-gold/20 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-groove-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-accent-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-custom mb-0.5">{label}</div>
                    <div className="text-sm text-primary group-hover:text-accent-gold transition-colors">
                      {value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-surface-2 border border-subtle">
              <h3 className="font-semibold text-primary mb-2 text-sm">Response Time</h3>
              <p className="text-xs text-secondary leading-relaxed">
                We respond to all enquiries within 24 business hours. For urgent projects, call us
                directly and we&apos;ll arrange a same-day consultation.
              </p>
            </div>

            {/* Cities */}
            <div className="p-6 rounded-2xl bg-surface-2 border border-subtle">
              <h3 className="font-semibold text-primary mb-3 text-sm">We Operate In</h3>
              <div className="flex flex-wrap gap-1.5">
                {['Mumbai', 'Delhi', 'Gurgaon', 'Noida', 'Jaipur', 'Hyderabad', 'Bangalore', 'Goa'].map((city) => (
                  <span key={city} className="text-xs px-2.5 py-1 rounded-full border border-subtle text-secondary">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* FAQ */}
        <AnimatedSection>
          <div className="border-t border-subtle pt-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-groove-gold" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
                FAQ
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-10">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl">
              <FaqAccordion />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
