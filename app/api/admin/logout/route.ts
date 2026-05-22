import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url))
  response.cookies.set('admin_auth', '', {
    path: '/',
    maxAge: 0,
  })

  return response
}
