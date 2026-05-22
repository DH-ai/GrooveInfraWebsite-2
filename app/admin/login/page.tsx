import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin Login',
}

interface AdminLoginProps {
  searchParams?: {
    error?: string
  }
}

export default function AdminLoginPage({ searchParams }: AdminLoginProps) {
  const adminToken = process.env.ADMIN_TOKEN
  const token = cookies().get('admin_auth')?.value
  if (adminToken && token === adminToken) {
    redirect('/admin')
  }

  const error = searchParams?.error
  const isMissingConfig = error === 'missing-config'

  return (
    <div className="min-h-screen bg-base pt-24 pb-20">
      <div className="max-w-md mx-auto px-4">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent-gold">
          Admin
        </p>
        <h1 className="font-display text-3xl font-bold text-primary mt-3">Sign in</h1>

        {isMissingConfig && (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Admin environment variables are missing. Set ADMIN_USERNAME, ADMIN_PASSWORD, and
            ADMIN_TOKEN in .env.local.
          </div>
        )}

        {error && !isMissingConfig && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            Invalid username or password.
          </div>
        )}

        <form
          action="/api/admin/login"
          method="post"
          className="mt-6 rounded-3xl bg-surface-2 border border-subtle p-6 space-y-4"
        >
          <label className="flex flex-col gap-2 text-sm text-secondary">
            Username
            <input
              name="username"
              required
              className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
              placeholder="admin"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-secondary">
            Password
            <input
              name="password"
              type="password"
              required
              className="h-11 rounded-xl border border-subtle bg-base px-4 text-primary"
            />
          </label>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-groove-gold text-black text-sm font-semibold hover:shadow-gold transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
