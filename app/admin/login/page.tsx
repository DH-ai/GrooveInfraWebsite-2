import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/admin-auth'
import Notice from '@/components/ui/Notice'
import PageHeader from '@/components/ui/PageHeader'
import PageShell from '@/components/ui/PageShell'
import {
  fieldInputClass,
  fieldLabelStackClass,
  primaryButtonClass,
} from '@/components/ui/field-styles'

export const metadata: Metadata = {
  title: 'Admin Login',
}

interface AdminLoginProps {
  searchParams?: {
    error?: string
    next?: string
  }
}

/** Only same-origin relative paths, so `?next=` cannot be used as an open redirect. */
function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  return value
}

export default async function AdminLoginPage({ searchParams }: AdminLoginProps) {
  const auth = await checkAdminAuth()
  if (auth.ok) {
    redirect('/admin')
  }

  const error = searchParams?.error
  const isMissingConfig = error === 'missing-config'
  const isExpired = error === 'expired'
  const isRateLimited = error === 'rate-limited'
  const nextPath = safeNextPath(searchParams?.next)

  return (
    <PageShell width="reading">
      <div className="max-w-[28rem]">
        <PageHeader label="Admin" title="Sign in." />

        {isMissingConfig && (
          <Notice tone="warning" className="mt-10">
            Admin environment variables are missing. Set ADMIN_USERNAME, ADMIN_PASSWORD, and
            ADMIN_SESSION_SECRET (or ADMIN_TOKEN) in .env.local.
          </Notice>
        )}

        {isExpired && (
          <Notice tone="warning" className="mt-10">
            Your session expired. Please sign in again.
          </Notice>
        )}

        {isRateLimited && (
          <Notice tone="error" className="mt-10">
            Too many sign-in attempts. Please wait a few minutes and try again.
          </Notice>
        )}

        {error && !isMissingConfig && !isExpired && !isRateLimited && (
          <Notice tone="error" className="mt-10">
            Invalid username or password.
          </Notice>
        )}

        <form
          action="/api/admin/login"
          method="post"
          className="mt-12 space-y-8 border-t border-strong pt-10"
        >
          <input type="hidden" name="next" value={nextPath} />
          <label className={fieldLabelStackClass}>
            Username
            <input name="username" required className={fieldInputClass} placeholder="admin" />
          </label>
          <label className={fieldLabelStackClass}>
            Password
            <input name="password" type="password" required className={fieldInputClass} />
          </label>
          <button type="submit" className={primaryButtonClass}>
            Sign in
          </button>
        </form>
      </div>
    </PageShell>
  )
}
