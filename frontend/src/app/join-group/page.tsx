'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RainbowText from '@/components/RainbowText';
import { createClient } from '@/lib/supabase';
import { GroupPreview } from '@/types/database.types';

export default function JoinGroupPage() {
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupPreview, setGroupPreview] = useState<GroupPreview | null>(null);
  const router = useRouter();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setGroupCode(value);
      setError('');
      setGroupPreview(null);
    }
  };

  const handlePreviewGroup = async () => {
    if (!groupCode || groupCode.length !== 6) {
      setError('Please enter a valid 6-character group code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Look up the group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name, created_at')
        .eq('group_code', groupCode)
        .single();

      if (groupError || !group) {
        setError('Invalid group code. Please check and try again.');
        setGroupPreview(null);
        return;
      }

      // Get member count
      const { data: members, error: membersError } = await supabase
        .from('profile')
        .select('id')
        .eq('group_id', group.id);

      if (!membersError) {
        setGroupPreview({
          ...group,
          memberCount: members?.length || 0,
        });
      } else {
        setGroupPreview(group);
      }
    } catch (err: unknown) {
      console.error('Error previewing group:', err);
      setError('Failed to find group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupPreview) return;

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

      // Check if user is already in a group
      const { data: profile } = await supabase
        .from('profile')
        .select('group_id')
        .eq('id', user.id)
        .single();

      if (profile?.group_id) {
        const confirmLeave = confirm(
          'You are already in a group. Do you want to leave your current group and join this one?'
        );
        if (!confirmLeave) {
          setLoading(false);
          return;
        }
      }

      // Update user's profile with the new group_id
      const { error: profileError } = await supabase
        .from('profile')
        .update({ group_id: groupPreview.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Success!
      alert(`Successfully joined "${groupPreview.name}"!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Error joining group:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to join group. Please try again.');
      } else {
        setError('Failed to join group. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <main className="ml-[200px] w-full flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <header className="mb-8 text-center">
            <RainbowText 
              text="Join a Group" 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
              Enter the group code you received to join a gift exchange
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <label className="chalk-text text-pareto-light text-lg block mb-3">
                  Group Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={groupCode}
                    onChange={handleCodeChange}
                    placeholder="ABC123"
                    maxLength={6}
                    className="flex-1 px-6 py-4 bg-white/5 border-2 border-white/20 rounded-xl chalk-text text-pareto-light text-3xl font-bold tracking-widest uppercase text-center placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-blue"
                  />
                  <button
                    onClick={handlePreviewGroup}
                    disabled={loading || groupCode.length !== 6}
                    className="px-6 py-4 bg-pareto-blue text-pareto-light font-display text-lg rounded-xl hover:opacity-80 disabled:opacity-50 transition-opacity whitespace-nowrap"
                  >
                    {loading ? 'Checking...' : 'Find Group'}
                  </button>
                </div>
                <p className="chalk-text text-pareto-light/60 text-sm mt-2">
                  Enter the 6-character code (letters and numbers)
                </p>
              </div>

              {error && (
                <div className="bg-pareto-orange/20 border border-pareto-orange rounded-lg p-4">
                  <p className="chalk-text text-pareto-orange text-sm">
                    {error}
                  </p>
                </div>
              )}

              {groupPreview && (
                <div className="bg-pareto-green/20 border-2 border-pareto-green rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pareto-green rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-pareto-green">
                        Group Found!
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="chalk-text text-pareto-light/80 text-sm">Group Name:</span>
                      <span className="font-display text-pareto-light text-xl">{groupPreview.name}</span>
                    </div>
                    
                    {groupPreview.memberCount !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="chalk-text text-pareto-light/80 text-sm">Members:</span>
                        <span className="chalk-text text-pareto-light text-base">{groupPreview.memberCount} {groupPreview.memberCount === 1 ? 'person' : 'people'}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="chalk-text text-pareto-light/80 text-sm">Created:</span>
                      <span className="chalk-text text-pareto-light text-base">
                        {new Date(groupPreview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleJoinGroup}
                    disabled={loading}
                    className="w-full bg-pareto-green text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity mt-4"
                  >
                    {loading ? 'Joining...' : 'Join This Group'}
                  </button>
                </div>
              )}
            </div>

            {!groupPreview && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <h3 className="font-display text-xl text-pareto-yellow mb-4">
                  How to get a group code
                </h3>
                <div className="space-y-3 chalk-text text-pareto-light/80 text-base">
                  <p className="flex gap-3">
                    <span className="font-display text-pareto-pink text-xl flex-shrink-0">•</span>
                    <span>Ask the person who created the group to share the code</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="font-display text-pareto-yellow text-xl flex-shrink-0">•</span>
                    <span>Group codes are 6 characters (letters and numbers)</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="font-display text-pareto-green text-xl flex-shrink-0">•</span>
                    <span>Codes are case-insensitive (ABC123 = abc123)</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/create-group')}
              className="chalk-text text-pareto-light/80 text-base hover:text-pareto-light transition-colors"
            >
              Want to create your own group instead?
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}