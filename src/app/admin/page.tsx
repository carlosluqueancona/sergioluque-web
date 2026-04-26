import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT, getJWTSecret, COOKIE_NAME } from '@/lib/admin/jwt'

export default async function AdminIndexPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    try {
      const payload = await verifyJWT(token, getJWTSecret())
      if (payload) redirect('/admin/obras')
    } catch {
      // fall through to login
    }
  }

  redirect('/admin/login')
}
