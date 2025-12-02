'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import { createClient } from '@/lib/supabase';

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      console.log('Creating group for user:', user.id);

      // STEP 1: Ensure profile exists (but don't error if it already exists)
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profile')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if no row

      if (!existingProfile && !profileCheckError) {
        console.log('Profile does not exist, creating...');
        const { error: profileCreateError } = await supabase
          .from('profile')
          .insert({ id: user.id });
        
        // Ignore duplicate key error (23505) - profile already exists
        if (profileCreateError && profileCreateError.code !== '23505') {
          console.error('Error creating profile:', profileCreateError);
          throw new Error('Failed to create user profile: ' + profileCreateError.message);
        }
      } else {
        console.log('Profile already exists');
      }

      // STEP 2: Generate a unique 6-character group code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('Generated group code:', generatedCode);

      // STEP 3: Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          group_code: generatedCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        throw new Error('Failed to create group: ' + groupError.message);
      }

      console.log('Group created successfully:', newGroup);

      // STEP 4: Update user's profile with the new group_id (auto-join)
      const { error: profileUpdateError } = await supabase
        .from('profile')
        .update({ group_id: newGroup.id })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        throw new Error('Failed to join group: ' + profileUpdateError.message);
      }

      console.log('Profile updated, user joined group');

      // Success! Show the group code and redirect
      alert(`Group created successfully! Your group code is: ${generatedCode}\n\nShare this code with others so they can join.`);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group. Please try again.');
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
              text="Create a New Group" 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
              Start a gift exchange with your friends, family, or coworkers!
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8">
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="chalk-text text-pareto-light text-lg block mb-3">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Family Christmas 2024, Office Secret Santa..."
                  maxLength={100}
                  className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-xl chalk-text text-pareto-light text-lg placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-pink"
                />
                <p className="chalk-text text-pareto-light/60 text-sm mt-2">
                  Choose a descriptive name for your gift exchange group
                </p>
              </div>

              {error && (
                <div className="bg-pareto-orange/20 border border-pareto-orange rounded-lg p-4">
                  <p className="chalk-text text-pareto-orange text-sm font-bold mb-2">
                    Error:
                  </p>
                  <p className="chalk-text text-pareto-orange text-sm">
                    {error}
                  </p>
                  <p className="chalk-text text-pareto-orange/80 text-xs mt-2">
                    Check the browser console (F12) for more details.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !groupName.trim()}
                className="w-full bg-pareto-pink text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="font-display text-xl text-pareto-yellow mb-4">
                What happens next?
              </h3>
              <ol className="space-y-3 chalk-text text-pareto-light/80 text-base">
                <li className="flex gap-3">
                  <span className="font-display text-pareto-pink text-xl flex-shrink-0">1.</span>
                  <span>You'll get a unique 6-digit group code</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-yellow text-xl flex-shrink-0">2.</span>
                  <span>Share the code with people you want to invite</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-green text-xl flex-shrink-0">3.</span>
                  <span>Everyone fills out their gift preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-pareto-blue text-xl flex-shrink-0">4.</span>
                  <span>As the creator, you'll run the matching algorithm!</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/join-group')}
              className="chalk-text text-pareto-light/80 text-base hover:text-pareto-light transition-colors"
            >
              Want to join an existing group instead?
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}