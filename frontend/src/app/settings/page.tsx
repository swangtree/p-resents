'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import { createClient } from '@/lib/supabase';

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [groupCode, setGroupCode] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profile')
        .select('group_id')
        .eq('id', user.id)
        .single();

      if (profile?.group_id) {
        setGroupId(profile.group_id);

        const { data: group } = await supabase
          .from('groups')
          .select('name, group_code, created_by')
          .eq('id', profile.group_id)
          .single();

        if (group) {
          setGroupName(group.name);
          setGroupCode(group.group_code);
          setIsAdmin(group.created_by === user.id);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (!userId) {
      alert('User not logged in');
      return;
    }

    try {
      const supabase = createClient();
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName,
          group_code: generatedCode,
          created_by: userId,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      await supabase
        .from('profile')
        .update({ group_id: newGroup.id })
        .eq('id', userId);

      alert(`Group created! Share code: ${generatedCode}`);
      await loadUserSettings();
      setNewGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      alert('Please enter a group code');
      return;
    }

    if (!userId) {
      alert('User not logged in');
      return;
    }

    try {
      const supabase = createClient();

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('group_code', joinCode.toUpperCase())
        .single();

      if (groupError || !group) {
        alert('Invalid group code');
        return;
      }

      await supabase
        .from('profile')
        .update({ group_id: group.id })
        .eq('id', userId);

      alert('Successfully joined group!');
      await loadUserSettings();
      setJoinCode('');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!userId || !groupId) {
      alert('Missing user or group information');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to leave this group? Your preferences will be deleted.'
    );

    if (!confirmed) return;

    try {
      const supabase = createClient();

      // Delete preferences
      await supabase
        .from('preferences')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);

      // Leave group
      await supabase
        .from('profile')
        .update({ group_id: null })
        .eq('id', userId);

      alert('Left group successfully');
      await loadUserSettings();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const copyGroupCode = () => {
    navigator.clipboard.writeText(groupCode);
    alert('Group code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center">
        <Sidebar />
        <main className="ml-[200px] w-full">
          <p className="chalk-text text-pareto-light text-xl">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />
      <main className="ml-[200px] w-full p-8">
        <header className="mb-8">
          <RainbowText 
            text="Settings" 
            className="text-3xl sm:text-4xl md:text-5xl mb-3"
          />
          <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
            Manage your account and group settings
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          {/* Account Settings */}
          <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl text-pareto-pink mb-6">
              Account
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="chalk-text text-pareto-light/60 text-sm block mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-white/5 rounded-lg chalk-text text-pareto-light">
                  {email}
                </div>
              </div>

              <div>
                <label className="chalk-text text-pareto-light/60 text-sm block mb-2">
                  User ID
                </label>
                <div className="px-4 py-3 bg-white/5 rounded-lg chalk-text text-pareto-light text-xs break-all">
                  {userId}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full bg-pareto-pink/20 border border-pareto-pink text-pareto-pink px-6 py-3 rounded-lg font-display text-lg hover:bg-pareto-pink/30 transition-colors"
            >
              Sign Out
            </button>
          </section>

          {/* Current Group */}
          {groupId ? (
            <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-3xl text-pareto-yellow mb-6">
                Your Group
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="chalk-text text-pareto-light/60 text-sm block mb-2">
                    Group Name
                  </label>
                  <div className="px-4 py-3 bg-white/5 rounded-lg chalk-text text-pareto-light">
                    {groupName}
                  </div>
                </div>

                <div>
                  <label className="chalk-text text-pareto-light/60 text-sm block mb-2">
                    Group Code
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-white/5 rounded-lg chalk-text text-pareto-light font-bold text-2xl">
                      {groupCode}
                    </div>
                    <button
                      onClick={copyGroupCode}
                      className="px-4 bg-pareto-yellow text-pareto-dark font-display rounded-lg hover:opacity-80 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="chalk-text text-pareto-light/60 text-xs mt-2">
                    Share this code with others to invite them
                  </p>
                </div>

                {isAdmin && (
                  <div className="px-4 py-3 bg-pareto-yellow/20 border border-pareto-yellow rounded-lg">
                    <p className="chalk-text text-pareto-yellow text-sm">
                      ✓ You're the group admin
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleLeaveGroup}
                className="w-full bg-pareto-orange/20 border border-pareto-orange text-pareto-orange px-6 py-3 rounded-lg font-display text-lg hover:bg-pareto-orange/30 transition-colors"
              >
                Leave Group
              </button>
            </section>
          ) : (
            <>
              {/* Create Group */}
              <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl text-pareto-green mb-6">
                  Create a Group
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="chalk-text text-pareto-light text-sm block mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Family Gift Exchange 2024"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg chalk-text text-pareto-light placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-green"
                    />
                  </div>

                  <button
                    onClick={handleCreateGroup}
                    className="w-full bg-pareto-green text-pareto-light px-6 py-3 rounded-lg font-display text-lg hover:opacity-80 transition-opacity"
                  >
                    Create Group
                  </button>
                </div>
              </section>

              {/* Join Group */}
              <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl text-pareto-blue mb-6">
                  Join a Group
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="chalk-text text-pareto-light text-sm block mb-2">
                      Group Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg chalk-text text-pareto-light text-2xl font-bold placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-blue uppercase"
                    />
                  </div>

                  <button
                    onClick={handleJoinGroup}
                    className="w-full bg-pareto-blue text-pareto-light px-6 py-3 rounded-lg font-display text-lg hover:opacity-80 transition-opacity"
                  >
                    Join Group
                  </button>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Info Section */}
        <section className="mt-8 max-w-6xl bg-white/5 rounded-2xl p-6 sm:p-8">
          <h3 className="font-display text-xl text-pareto-orange mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-display text-3xl text-pareto-pink mb-2">1</div>
              <p className="chalk-text text-pareto-light text-sm">
                <strong>Create or join a group</strong> using the group code
              </p>
            </div>
            <div>
              <div className="font-display text-3xl text-pareto-yellow mb-2">2</div>
              <p className="chalk-text text-pareto-light text-sm">
                <strong>Fill out your preferences</strong> on the Dashboard
              </p>
            </div>
            <div>
              <div className="font-display text-3xl text-pareto-green mb-2">3</div>
              <p className="chalk-text text-pareto-light text-sm">
                <strong>Admin runs the algorithm</strong> and everyone gets matched!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}