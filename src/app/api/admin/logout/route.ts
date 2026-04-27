export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'sl_admin_jwt'

export async function POST(req: NextRequest) {
  const url = new URL('/admin/login', req.url)
  const response = NextResponse.redirect(url, { status: 303 })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
