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
      setError('Name is required');
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

      const { error: updateError } = await supabase
        .from('profile')
        .upsert({
          id: user.id,
          name: name.trim(),
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        throw updateError;
      }

      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Error saving name:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to save name. Please try again.');
      } else {
        setError('Failed to save name. Please try again.');
      }
    } finally {
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
              text="Welcome to Pareto Presents!" 
              className="text-3xl sm:text-4xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base">
              Let&apos;s set up your profile to get started
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8">
            <form onSubmit={handleSaveName} className="space-y-6">
              <div>
                <label className="chalk-text text-pareto-light text-sm block mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={50}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg chalk-text text-pareto-light placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-pink"
                />
                <p className="chalk-text text-pareto-light/60 text-xs mt-2">
                  This name will be visible to other group members
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-pareto-orange/20 border border-pareto-orange">
                  <p className="chalk-text text-pareto-light text-sm">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-pareto-pink text-pareto-light px-6 py-3 rounded-lg font-display text-xl hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>

            <div className="mt-8 p-6 bg-white/5 rounded-xl">
              <h3 className="font-display text-xl text-pareto-blue mb-3">
                What&apos;s Next?
              </h3>
              <ul className="space-y-2 chalk-text text-pareto-light/80 text-sm">
                <li>🎁 <span>Create or join a gift exchange group</span></li>
                <li>⚡ <span>Fill out your preferences</span></li>
                <li>🎯 <span>See who you&apos;re matched with!</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
