'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();

      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // NOTE: Ensure this path is correct
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create profile entry
          const { error: profileError } = await supabase
            .from('profile')
            .insert({ id: data.user.id });

          if (profileError && profileError.code !== '23505') { 
            console.error('Profile creation error:', profileError);
          }

          setMessage('Account created! Please check your email to verify your account.');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Ensure profile exists (Good for existing OAuth users logging in via email later)
          const { data: profile } = await supabase
            .from('profile')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!profile) {
            await supabase
              .from('profile')
              .insert({ id: data.user.id });
          }

          setMessage('Logged in successfully!');
          setTimeout(() => {
            // EDITED: Redirect to dashboard after successful login
            router.push('/dashboard'); 
          }, 500);
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      if (error instanceof Error) {
      setMessage(error.message || 'An error occurred');
      } else {
      setMessage('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // NOTE: Ensure this path is correct
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      if (error instanceof Error) {
      setMessage(error.message || 'Failed to sign in with Google');
      } else {
      setMessage('Failed to sign in with Google');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />
      <main className="ml-[200px] w-full flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <header className="mb-8 text-center">
            <RainbowText 
              text={isSignUp ? "Create Account" : "Welcome Back!"} 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base">
              {isSignUp 
                ? "Sign up to start your gift exchange journey" 
                : "Sign in to continue to Pareto Presents"}
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="chalk-text text-pareto-light text-sm block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg chalk-text text-pareto-light placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-pink"
                />
              </div>

              <div>
                <label className="chalk-text text-pareto-light text-sm block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg chalk-text text-pareto-light placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-pink"
                />
                {isSignUp && (
                  <p className="chalk-text text-pareto-light/60 text-xs mt-2">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('error') || message.includes('Failed')
                    ? 'bg-pareto-orange/20 border border-pareto-orange'
                    : 'bg-pareto-green/20 border border-pareto-green'
                }`}>
                  <p className="chalk-text text-pareto-light text-sm">
                    {message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pareto-pink text-pareto-light px-6 py-3 rounded-lg font-display text-xl hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-pareto-dark chalk-text text-pareto-light/60">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/10 border border-white/20 text-pareto-light px-6 py-3 rounded-lg chalk-text text-base hover:bg-white/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage('');
                }}
                className="chalk-text text-pareto-light/80 text-sm hover:text-pareto-light transition-colors"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="chalk-text text-pareto-light/60 text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}