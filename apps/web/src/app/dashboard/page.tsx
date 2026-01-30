'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import HanddrawnButton from '@/components/HanddrawnButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase';
import { SupabaseService } from '@/services/supabase.service';
import { GroupMember } from '@/types/database.types';

export default function DashboardPage() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    preference_practicality_giving: 3,
    preference_novelty_giving: 3,
    preference_thoughtfulness_giving: 3,
    preference_practicality_receiving: 3,
    preference_novelty_receiving: 3,
    preference_thoughtfulness_receiving: 3,
    we_hate_being_stolen_from: 3,
    we_enjoy_stealing: 3,
    hate_missing_out: 3,
    enjoy_missing_out: 3,
    interests: [] as string[],
    exclusions: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profile')
        .select('group_id')
        .eq('id', user.id)
        .single();

      if (profile?.group_id) {
        setGroupId(profile.group_id);
        await loadPreferences(profile.group_id, user.id);
        await loadGroupMembers(profile.group_id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async (groupId: string, userId: string) => {
    try {
      const prefs = await SupabaseService.getGroupPreferences(groupId);
      const userPref = prefs.find(p => p.user_id === userId);
      if (userPref) {
        setPreferences({
          preference_practicality_giving: userPref.preference_practicality_giving || 3,
          preference_novelty_giving: userPref.preference_novelty_giving || 3,
          preference_thoughtfulness_giving: userPref.preference_thoughtfulness_giving || 3,
          preference_practicality_receiving: userPref.preference_practicality_receiving || 3,
          preference_novelty_receiving: userPref.preference_novelty_receiving || 3,
          preference_thoughtfulness_receiving: userPref.preference_thoughtfulness_receiving || 3,
          we_hate_being_stolen_from: userPref.we_hate_being_stolen_from || 3,
          we_enjoy_stealing: userPref.we_enjoy_stealing || 3,
          hate_missing_out: userPref.hate_missing_out || 3,
          enjoy_missing_out: userPref.enjoy_missing_out || 3,
          interests: userPref.interests || [],
          exclusions: userPref.exclusions || [],
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const members = await SupabaseService.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

  const handleSave = async () => {
    if (!groupId || !userId) {
      showToast('Missing group or user information', 'error');
      return;
    }

    setSaving(true);
    try {
      await SupabaseService.savePreferences({
        user_id: userId,
        group_id: groupId,
        ...preferences,
      });

      showToast('Preferences saved successfully!', 'success');
    } catch (error: unknown) {
      console.error('Error saving preferences:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        const errorMessage = error?.message || 'Unknown error';
        showToast(`Failed to save preferences: ${errorMessage}`, 'error');
      } else {
        showToast('Failed to save preferences. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !preferences.interests.includes(newInterest.trim())) {
      setPreferences({
        ...preferences,
        interests: [...preferences.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setPreferences({
      ...preferences,
      interests: preferences.interests.filter(i => i !== interest),
    });
  };

  const toggleExclusion = (memberId: string) => {
    if (preferences.exclusions.includes(memberId)) {
      setPreferences({
        ...preferences,
        exclusions: preferences.exclusions.filter(id => id !== memberId),
      });
    } else {
      setPreferences({
        ...preferences,
        exclusions: [...preferences.exclusions, memberId],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center">
        <Sidebar />
        <main className="ml-[200px] w-full flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your preferences..." />
        </main>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="flex bg-pareto-dark min-h-screen">
        <Sidebar />
        <main className="ml-[200px] w-full p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <header className="mb-8 text-center">
              <RainbowText 
                text="Welcome to Dashboard!" 
                className="text-3xl sm:text-4xl md:text-5xl mb-4"
              />
              <p className="chalk-text text-pareto-light/80 text-lg">
                You&apos;re not part of a group yet. Let&apos;s get you started!
              </p>
            </header>

            <div className="bg-white/10 rounded-2xl p-8 text-center space-y-6">
              <p className="chalk-text text-pareto-light text-base">
                To use Pareto Presents, you need to either create a new gift exchange group 
                or join an existing one with a group code.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <HanddrawnButton
                  text="Create a Group"
                  fillColor="#ff7eba"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                  onClick={() => router.push('/create-group')}
                />
                <HanddrawnButton
                  text="Join a Group"
                  fillColor="#6caade"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                  onClick={() => router.push('/join-group')}
                />
              </div>

              <div className="pt-6 border-t border-white/20">
                <h3 className="font-display text-xl text-pareto-yellow mb-3">
                  What&apos;s the difference?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-display text-lg text-pareto-pink mb-2">Create</h4>
                    <p className="chalk-text text-pareto-light/80 text-sm">
                      Start a new group, get a code, and invite others. You&apos;ll be the admin!
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-display text-lg text-pareto-blue mb-2">Join</h4>
                    <p className="chalk-text text-pareto-light/80 text-sm">
                      Have a code from a friend? Enter it to join their gift exchange.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            text="Your Gift Preferences" 
            className="text-3xl sm:text-4xl md:text-5xl mb-3"
          />
          <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
            Tell us about your gifting style so we can make better matches!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
          {/* Preferences Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Giving Preferences */}
            <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-3xl text-pareto-pink mb-6">
                Giving Preferences
              </h2>
              <p className="chalk-text text-pareto-light/80 text-sm mb-6">
                How do you like to choose gifts for others?
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Practicality
                    </label>
                    <span className="font-display text-pareto-pink text-2xl">
                      {preferences.preference_practicality_giving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_practicality_giving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_practicality_giving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-pink"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Whimsical</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Super Useful</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Novelty
                    </label>
                    <span className="font-display text-pareto-pink text-2xl">
                      {preferences.preference_novelty_giving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_novelty_giving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_novelty_giving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-pink"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Classic</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Unique</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Sentimentality
                    </label>
                    <span className="font-display text-pareto-pink text-2xl">
                      {preferences.preference_thoughtfulness_giving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_thoughtfulness_giving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_thoughtfulness_giving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-pink"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Casual</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Meaningful</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Receiving Preferences */}
            <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-3xl text-pareto-yellow mb-6">
                Receiving Preferences
              </h2>
              <p className="chalk-text text-pareto-light/80 text-sm mb-6">
                What kind of gifts do you appreciate most?
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Practicality
                    </label>
                    <span className="font-display text-pareto-yellow text-2xl">
                      {preferences.preference_practicality_receiving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_practicality_receiving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_practicality_receiving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-yellow"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Fun things</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Useful things</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Novelty
                    </label>
                    <span className="font-display text-pareto-yellow text-2xl">
                      {preferences.preference_novelty_receiving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_novelty_receiving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_novelty_receiving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-yellow"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Familiar</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Surprising</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Sentimentality
                    </label>
                    <span className="font-display text-pareto-yellow text-2xl">
                      {preferences.preference_thoughtfulness_receiving}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.preference_thoughtfulness_receiving}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preference_thoughtfulness_receiving: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-yellow"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Any gift</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Thoughtful</span>
                  </div>
                </div>
              </div>
            </section>

            {/* White Elephant Preferences */}
            <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-3xl text-pareto-blue mb-6">
                White Elephant Preferences
              </h2>
              <p className="chalk-text text-pareto-light/80 text-sm mb-6">
                How do you feel about the White Elephant game dynamics?
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Hate Being Stolen From
                    </label>
                    <span className="font-display text-pareto-blue text-2xl">
                      {preferences.we_hate_being_stolen_from}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.we_hate_being_stolen_from}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      we_hate_being_stolen_from: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-blue"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Don&apos;t mind</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Really dislike</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Enjoy Stealing
                    </label>
                    <span className="font-display text-pareto-blue text-2xl">
                      {preferences.we_enjoy_stealing}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.we_enjoy_stealing}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      we_enjoy_stealing: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-blue"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Not my style</span>
                    <span className="chalk-text text-xs text-pareto-light/60">Love it</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Hate Missing Out
                    </label>
                    <span className="font-display text-pareto-blue text-2xl">
                      {preferences.hate_missing_out}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.hate_missing_out}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      hate_missing_out: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-blue"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Zen about it</span>
                    <span className="chalk-text text-xs text-pareto-light/60">FOMO is real</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="chalk-text text-pareto-light text-base">
                      Enjoy Missing Out
                    </label>
                    <span className="font-display text-pareto-blue text-2xl">
                      {preferences.enjoy_missing_out}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={preferences.enjoy_missing_out}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      enjoy_missing_out: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pareto-blue"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="chalk-text text-xs text-pareto-light/60">Not at all</span>
                    <span className="chalk-text text-xs text-pareto-light/60">JOMO vibes</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Interests */}
            <section className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-3xl text-pareto-orange mb-6">
                Your Interests
              </h2>
              <p className="chalk-text text-pareto-light/80 text-sm mb-6">
                Add some interests to help match you better!
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  placeholder="e.g., hiking, cooking, gaming..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg chalk-text text-pareto-light placeholder:text-pareto-light/40 focus:outline-none focus:border-pareto-orange"
                />
                <button
                  onClick={addInterest}
                  className="px-6 py-2 bg-pareto-orange text-pareto-light font-display text-lg rounded-lg hover:opacity-80 transition-opacity"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {preferences.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-pareto-orange/20 border border-pareto-orange/40 rounded-full chalk-text text-pareto-light text-sm flex items-center gap-2"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="text-pareto-orange hover:text-pareto-light transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {preferences.interests.length === 0 && (
                  <p className="chalk-text text-pareto-light/60 text-sm italic">
                    No interests added yet
                  </p>
                )}
              </div>
            </section>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-pareto-green text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" color="border-pareto-light" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>

          {/* Sidebar - Group Members & Exclusions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Members */}
            <section className="bg-white/10 rounded-2xl p-6">
              <h3 className="font-display text-xl text-pareto-blue mb-4">
                Group Members
              </h3>
              <div className="space-y-3">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <span className="chalk-text text-pareto-light text-sm truncate">
                      {member.user_data?.email || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Exclusions */}
            <section className="bg-white/10 rounded-2xl p-6">
              <h3 className="font-display text-xl text-pareto-blue mb-2">
                Don&apos;t Match Me With
              </h3>
              <p className="chalk-text text-pareto-light/60 text-xs mb-4">
                Select people you shouldn&apos;t be matched with
              </p>
              <div className="space-y-2">
                {groupMembers
                  .filter(m => m.id !== userId)
                  .map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.exclusions.includes(member.id)}
                        onChange={() => toggleExclusion(member.id)}
                        className="w-4 h-4 accent-pareto-blue"
                      />
                      <span className="chalk-text text-pareto-light text-sm truncate">
                        {member.user_data?.email || 'Unknown'}
                      </span>
                    </label>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}