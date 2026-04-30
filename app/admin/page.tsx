'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProjectFormData {
  title: string
  slug: string
  category: 'commercial' | 'retail' | 'residential' | 'civil'
  location: string
  client_name: string
  testimonial: string
  description: string
  year: string
  area: string
  duration: string
  featured: boolean
  tags: string
}

const INITIAL_FORM: ProjectFormData = {
  title: '',
  slug: '',
  category: 'commercial',
  location: '',
  client_name: '',
  testimonial: '',
  description: '',
  year: new Date().getFullYear().toString(),
  area: '',
  duration: '',
  featured: false,
  tags: '',
}

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProjectFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Check if authenticated (via session/cookie check)
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check-auth')
        if (res.ok) {
          setAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (err) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }))

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setForm((prev) => ({
        ...prev,
        slug,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)

    try {
      const tagsArray = form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const projectData = {
        ...form,
        year: parseInt(form.year),
        featured: form.featured,
        tags: tagsArray,
      }

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create project',
        })
        return
      }

      setMessage({
        type: 'success',
        text: `Project "${form.title}" created successfully!`,
      })
      setForm(INITIAL_FORM)

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error creating project',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-groove-gold hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-2">Project Dashboard</h1>
          <p className="text-slate-400 mb-8">Add new projects to the portfolio</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-groove-gold">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., The Plaza Shopping Center"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="auto-generated from title"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                />
                <p className="text-xs text-slate-500 mt-1">Auto-generated, edit if needed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="retail">Retail</option>
                    <option value="residential">Residential</option>
                    <option value="civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                  />
                </div>
              </div>
            </div>

            {/* Client & Testimonial */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-lg font-semibold text-groove-gold">Client Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Client Name *</label>
                <input
                  type="text"
                  name="client_name"
                  value={form.client_name}
                  onChange={handleChange}
                  placeholder="e.g., Acme Corporation"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Testimonial * (1-2 sentences)
                </label>
                <textarea
                  name="testimonial"
                  value={form.testimonial}
                  onChange={handleChange}
                  placeholder="What the client said about this project..."
                  required
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description * (2-3 sentences)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Detailed description of what was built and its features..."
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition resize-none"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-lg font-semibold text-groove-gold">Project Details</h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2024"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Area *</label>
                  <input
                    type="text"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g., 10,000 sq ft"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g., 18 weeks"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated) *</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="e.g., Retail Design, Custom Millwork, Premium Finishes"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-groove-gold/50 transition"
                />
                <p className="text-xs text-slate-500 mt-1">3-5 tags separated by commas</p>
              </div>
            </div>

            {/* Featured & Actions */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-groove-gold"
                />
                <span className="text-sm font-medium">Featured on homepage?</span>
              </label>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-groove-gold to-groove-gold/80 hover:from-groove-gold/90 hover:to-groove-gold/70 text-black font-semibold rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-400 mb-4">
              After creating a project, add images to <code className="bg-white/5 px-2 py-1 rounded">public/images/projects/{form.slug}/</code>
            </p>
            <button
              onClick={() => router.push('/admin/login?logout=true')}
              className="text-sm text-groove-gold hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
