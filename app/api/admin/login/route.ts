import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  safeEqual,
} from '@/lib/admin-session'

/** Only same-origin relative paths, so `?next=` cannot be used as an open redirect. */
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  return value
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const nextPath = safeNextPath(String(formData.get('next') ?? '') || null)

  const envUser = process.env.ADMIN_USERNAME
  const envPass = process.env.ADMIN_PASSWORD

  if (!envUser || !envPass) {
    return NextResponse.redirect(new URL('/admin/login?error=missing-config', request.url))
  }

  // Evaluate both comparisons before branching so a wrong username and a wrong
  // password are indistinguishable by timing.
  const userMatches = safeEqual(username, envUser)
  const passMatches = safeEqual(password, envPass)
  if (!userMatches || !passMatches) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url))
  }

  const session = await createAdminSession()
  if (!session.ok) {
    return NextResponse.redirect(new URL('/admin/login?error=missing-config', request.url))
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url))

  response.cookies.set(ADMIN_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  })

  return response
}
