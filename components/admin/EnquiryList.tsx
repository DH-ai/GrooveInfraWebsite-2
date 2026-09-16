import { AlertTriangle } from 'lucide-react'
import type { EnquiryRecord } from '@/lib/enquiries'

interface EnquiryListProps {
  enquiries: EnquiryRecord[]
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EnquiryList({ enquiries }: EnquiryListProps) {
  if (enquiries.length === 0) {
    return (
      <p className="border-t border-subtle py-6 text-body text-secondary">
        No enquiries yet. Submissions from the contact form will appear here.
      </p>
    )
  }

  return (
    <ul className="border-b border-subtle">
      {enquiries.map((enquiry) => (
        <li key={enquiry.id} className="border-t border-subtle py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="font-display text-lede font-semibold text-primary">
              {enquiry.name}
              {enquiry.company && (
                <span className="ml-3 font-sans text-meta font-normal text-muted-custom">
                  {enquiry.company}
                </span>
              )}
            </h3>
            <time dateTime={enquiry.created_at} className="nums-tabular text-micro text-muted-custom">
              {formatDate(enquiry.created_at)}
            </time>
          </div>

          {/*
            Every row here is 44px tall. The email and phone are tap targets, and
            this list is the screen most likely to be read on a phone.

            The labels replace the icons that used to sit beside each value. A
            12px envelope and a 12px pin are not distinguishable at a glance, and
            an address is self-evidently an address without one.
          */}
          <dl className="mt-2 flex flex-wrap items-baseline gap-x-8">
            <div>
              <dt className="text-micro uppercase tracking-eyebrow text-muted-custom">Email</dt>
              <dd>
                <a
                  href={`mailto:${enquiry.email}`}
                  className="inline-flex min-h-11 items-center text-meta text-accent-gold hover:underline"
                >
                  {enquiry.email}
                </a>
              </dd>
            </div>
            {enquiry.phone && (
              <div>
                <dt className="text-micro uppercase tracking-eyebrow text-muted-custom">Phone</dt>
                <dd>
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex min-h-11 items-center text-meta text-accent-gold hover:underline"
                  >
                    {enquiry.phone}
                  </a>
                </dd>
              </div>
            )}
            {enquiry.location && (
              <div>
                <dt className="text-micro uppercase tracking-eyebrow text-muted-custom">Location</dt>
                <dd className="inline-flex min-h-11 items-center text-meta text-secondary">
                  {enquiry.location}
                </dd>
              </div>
            )}
            {enquiry.project_type && (
              <div>
                <dt className="text-micro uppercase tracking-eyebrow text-muted-custom">Type</dt>
                <dd className="inline-flex min-h-11 items-center text-meta text-secondary">
                  {enquiry.project_type}
                </dd>
              </div>
            )}
          </dl>

          <p className="measure mt-4 whitespace-pre-line text-body text-secondary">
            {enquiry.message}
          </p>

          {!enquiry.email_sent && (
            <p className="mt-5 inline-flex items-center gap-2 border-l-2 border-amber-400 bg-amber-500/10 px-3 py-2 text-micro uppercase tracking-eyebrow text-amber-100">
              <AlertTriangle size={12} aria-hidden="true" />
              Notification email did not send — follow up manually
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
