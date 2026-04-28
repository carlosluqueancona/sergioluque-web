export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')
  redirect('/admin/obras')
}
