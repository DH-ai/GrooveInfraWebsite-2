import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/admin-session'

/**
 * Single choke point for admin authentication.
 *
 * Previously each admin page re-implemented its own cookie check inline, so any
 * new page that forgot to do so would have been silently public. Route handlers
 * still call checkAdminAuth() as defence in depth.
 */

/** Reachable without a session: the login screen, and the endpoints that start/end one. */
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout'])

function isPublic(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.has(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const session = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
  if (session.ok) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: session.reason }, { status: 401 })
  }

  const loginUrl = new URL('/admin/login', request.url)
  if (session.reason !== 'unauthorized') loginUrl.searchParams.set('error', session.reason)
  // Send the admin back where they were headed once they authenticate.
  loginUrl.searchParams.set('next', pathname)

  const response = NextResponse.redirect(loginUrl)
  if (session.reason === 'expired') response.cookies.delete(ADMIN_COOKIE_NAME)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
