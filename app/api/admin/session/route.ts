import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'

/**
 * Lightweight probe for the public header. The session cookie is httpOnly, so
 * the client cannot read it; this endpoint only answers whether a valid admin
 * session is present so the Admin nav link can stay hidden from everyone else.
 */
export async function GET() {
  const auth = await checkAdminAuth()
  return NextResponse.json(
    { authenticated: auth.ok },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
