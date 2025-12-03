import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('User authenticated:', user.id)
        
        // Check if user has a profile with name
        const { data: profile, error: profileError } = await supabase
          .from('profile')
          .select('name')
          .eq('id', user.id)
          .maybeSingle()
        
        console.log('Profile check:', { profile, profileError })
        
        // If no profile exists or no name, redirect to setup
        if (!profile || !profile.name || profile.name.trim() === '') {
          console.log('Redirecting to setup-profile: no name found')
          return NextResponse.redirect(`${origin}/setup-profile`)
        }
        
        console.log('User has name, redirecting to dashboard')
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Auth error:', error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}