import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email_change' | null
  const next = searchParams.get('next') ?? '/'

  const cookieStore = await cookies()
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  // Google OAuth / PKCE code flow
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // Email confirmation / password reset link
  if (token_hash && type) {
    const { error } = await sb.auth.verifyOtp({ token_hash, type })
    if (!error) {
      if (type === 'signup') return NextResponse.redirect(`${origin}/`)
      if (type === 'recovery') return NextResponse.redirect(`${origin}/reset-password`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
