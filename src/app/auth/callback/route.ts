import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.getprimer.cloud'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure next is a relative path (prevent open redirect)
      const safePath = next.startsWith('/') ? next : '/dashboard'
      return NextResponse.redirect(`${appUrl}${safePath}`)
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
}
