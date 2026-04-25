import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-accent-gold mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-primary mb-3">Page Not Found</h1>
        <p className="text-secondary mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-groove-gold text-black font-medium text-sm hover:shadow-gold transition-all duration-300"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
