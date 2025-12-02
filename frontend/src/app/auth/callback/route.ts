// This file MUST be placed at: app/auth/callback/route.ts

import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Set the default redirect destination
  let redirectTo = '/dashboard'; 
  
  if (code) {
    const supabase = createClient();
    
    // Exchange the code for a session token
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // If successful, we need to ensure the profile exists (for OAuth sign-ups)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profile')
          .select('id')
          .eq('id', user.id)
          .single();

        // If the profile doesn't exist, create it immediately
        if (!profile) {
          // This handles user creation from OAuth or new user verification
          await supabase
            .from('profile')
            .insert({ id: user.id });
        }
      }
      // Leave redirectTo as /dashboard
    } else {
      // If there is an error during exchange (e.g., code expired), redirect to login with error
      redirectTo = `/login?error=${encodeURIComponent(error.message)}`;
    }
  }

  // Redirect the user to the final application page
  return NextResponse.redirect(new URL(redirectTo, request.url));
}