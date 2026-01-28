'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
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
  const { showToast } = useToast();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
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
      showToast('Please enter a group name', 'warning');
      return;
    }

    if (!userId) {
      showToast('User not logged in', 'error');
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

      showToast(`Group created! Share code: ${generatedCode}`, 'success');
      await loadUserSettings();
      setNewGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
      showToast('Failed to create group', 'error');
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      showToast('Please enter a group code', 'warning');
      return;
    }

    if (!userId) {
      showToast('User not logged in', 'error');
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
        showToast('Invalid group code', 'error');
        return;
      }

      await supabase
        .from('profile')
        .update({ group_id: group.id })
        .eq('id', userId);

      showToast('Successfully joined group!', 'success');
      await loadUserSettings();
      setJoinCode('');
    } catch (error) {
      console.error('Error joining group:', error);
      showToast('Failed to join group', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!userId || !groupId) {
      showToast('Missing user or group information', 'error');
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

      showToast('Left group successfully', 'success');
      await loadUserSettings();
    } catch (error) {
      console.error('Error leaving group:', error);
      showToast('Failed to leave group', 'error');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const copyGroupCode = () => {
    navigator.clipboard.writeText(groupCode);
    showToast('Group code copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center">
        <Sidebar />
        <main className="ml-[200px] w-full flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading settings..." />
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
                      ✓ You&apos;re the group admin
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
            <div className="space-y-6">
              {/* Create Group Card */}
              <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl text-pareto-green mb-4">
                  Create a Group
                </h2>
                <p className="chalk-text text-pareto-light/80 text-base mb-6">
                  Start a new gift exchange and get a code to share with others
                </p>
                
                <button
                  onClick={() => router.push('/create-group')}
                  className="w-full bg-pareto-green text-pareto-light px-6 py-3 rounded-lg font-display text-lg hover:opacity-80 transition-opacity"
                >
                  Create New Group
                </button>
              </section>

              {/* Join Group Card */}
              <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl text-pareto-blue mb-4">
                  Join a Group
                </h2>
                <p className="chalk-text text-pareto-light/80 text-base mb-6">
                  Have a code from a friend? Enter it to join their group
                </p>
                
                <button
                  onClick={() => router.push('/join-group')}
                  className="w-full bg-pareto-blue text-pareto-light px-6 py-3 rounded-lg font-display text-lg hover:opacity-80 transition-opacity"
                >
                  Join Existing Group
                </button>
              </section>
            </div>
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