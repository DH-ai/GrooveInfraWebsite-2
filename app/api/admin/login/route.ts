import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  const envUser = process.env.ADMIN_USERNAME
  const envPass = process.env.ADMIN_PASSWORD
  const adminToken = process.env.ADMIN_TOKEN

  if (!envUser || !envPass || !adminToken) {
    return NextResponse.redirect(new URL('/admin/login?error=missing-config', request.url))
  }

  if (username !== envUser || password !== envPass) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url))
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
  
  response.cookies.set('admin_auth', adminToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  return response
}
