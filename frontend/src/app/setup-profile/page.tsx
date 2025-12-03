'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import { createClient } from '@/lib/supabase';

export default function SetupProfilePage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Update profile with name
      const { error: profileError } = await supabase
        .from('profile')
        .upsert({
          id: user.id,
          name: name.trim(),
        });

      if (profileError) throw profileError;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving name:', err);
      setError(err.message || 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />
      <main className="ml-[200px] w-full flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <header className="mb-8 text-center">
            <RainbowText 
              text="Welcome to Pareto Presents!" 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
              Let's start by setting up your profile
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8">
            <form onSubmit={handleSaveName} className="space-y-6">
              <div>
                <label className="chalk-text text-pareto-light text-lg block mb-3">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-xl chalk-text text-pareto-light text-lg placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-pink"
                />
                <p className="chalk-text text-pareto-light/60 text-sm mt-2">
                  This will be displayed to other group members
                </p>
              </div>

              {error && (
                <div className="bg-pareto-orange/20 border border-pareto-orange rounded-lg p-4">
                  <p className="chalk-text text-pareto-orange text-sm">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-pareto-pink text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Saving...' : 'Continue to Dashboard'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="font-display text-xl text-pareto-yellow mb-4">
                What's Next?
              </h3>
              <ol className="space-y-3 chalk-text text-pareto-light/80 text-base">
                <li className="flex gap-3">
                  <span className="font-display text-pareto-pink text-xl flex-shrink-0">1.</span>
                  <span>Create or join a gift exchange group</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-yellow text-xl flex-shrink-0">2.</span>
                  <span>Fill out your gift preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-green text-xl flex-shrink-0">3.</span>
                  <span>Wait for the group admin to run matching</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-blue text-xl flex-shrink-0">4.</span>
                  <span>See who you&apos;re matched with!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}