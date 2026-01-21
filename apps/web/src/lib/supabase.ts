// frontend/src/lib/supabase.ts

import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

// Define a global variable (outside the function) to hold the singleton instance.
// We use let and initialize it as null/undefined.
let supabaseClient: SupabaseClient | undefined;

// Function to create or return the single client instance for use in the browser
export function createClient(): SupabaseClient {
  
  // 1. Check if the instance already exists. If it does, return it.
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // 2. Load environment variables. (Ensure they are prefixed with NEXT_PUBLIC_!)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  }

  // 3. Create the client instance and store it in the variable.
  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );

  // 4. Return the newly created instance.
  return supabaseClient;
}