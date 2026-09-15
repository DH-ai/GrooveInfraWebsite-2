import { Mail, Phone, MapPin, Building2, AlertTriangle } from 'lucide-react'
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
      <div className="rounded-2xl border border-subtle bg-surface-2 px-4 py-6 text-sm text-secondary">
        No enquiries yet. Submissions from the contact form will appear here.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {enquiries.map((enquiry) => (
        <li
          key={enquiry.id}
          className="rounded-2xl border border-subtle bg-surface-2 p-4 text-sm text-secondary"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-semibold text-primary">
              {enquiry.name}
              {enquiry.company && (
                <span className="ml-2 font-normal text-muted-custom">{enquiry.company}</span>
              )}
            </div>
            <time dateTime={enquiry.created_at} className="text-xs text-muted-custom">
              {formatDate(enquiry.created_at)}
            </time>
          </div>

          {/*
            Every row here is 44px tall. The email and phone are tap targets, and
            this list is the screen most likely to be read on a phone.
          */}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs">
            <a
              href={`mailto:${enquiry.email}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-accent-gold hover:underline"
            >
              <Mail size={12} aria-hidden="true" />
              {enquiry.email}
            </a>
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-accent-gold hover:underline"
              >
                <Phone size={12} aria-hidden="true" />
                {enquiry.phone}
              </a>
            )}
            {enquiry.location && (
              <span className="inline-flex min-h-11 items-center gap-1.5 text-muted-custom">
                <MapPin size={12} aria-hidden="true" />
                {enquiry.location}
              </span>
            )}
            {enquiry.project_type && (
              <span className="inline-flex min-h-11 items-center gap-1.5 text-muted-custom">
                <Building2 size={12} aria-hidden="true" />
                {enquiry.project_type}
              </span>
            )}
          </div>

          <p className="mt-3 whitespace-pre-line text-secondary">{enquiry.message}</p>

          {!enquiry.email_sent && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
              <AlertTriangle size={11} aria-hidden="true" />
              Notification email did not send — follow up manually
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
