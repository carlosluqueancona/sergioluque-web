import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    revalidatePath('/', 'layout')
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (_err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
