'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import { ApiService } from '@/services/api.service';
import { SupabaseService } from '@/services/supabase.service';
import { createClient } from '@/lib/supabase';
import { RecalculateResponse, FinalizeResponse } from '@/types/api.types';

export default function ResultsPage() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statistics, setStatistics] = useState<RecalculateResponse | null>(null);
  const [results, setResults] = useState<FinalizeResponse | null>(null);
  const [savedResults, setSavedResults] = useState<any>(null);
  const [selectedRuleset, setSelectedRuleset] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
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
        
        // Check if user is admin
        const { data: group } = await supabase
          .from('groups')
          .select('created_by')
          .eq('id', profile.group_id)
          .single();
        
        setIsAdmin(group?.created_by === user.id);

        // Load existing results
        const existingResults = await SupabaseService.getMatchResults(profile.group_id);
        if (existingResults) {
          setSavedResults(existingResults);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      const prefs = await SupabaseService.getGroupPreferences(groupId);
      
      if (prefs.length === 0) {
        alert('No preferences found. Please make sure group members have filled out their preferences.');
        return;
      }

      const preferences = prefs.map(p => ({
        user_id: p.user_id,
        giving_preferences: {
          practicality: p.giving_practicality || 3,
          novelty: p.giving_novelty || 3,
          sentimentality: p.giving_sentimentality || 3,
        },
        receiving_preferences: {
          practicality: p.receiving_practicality || 3,
          novelty: p.receiving_novelty || 3,
          sentimentality: p.receiving_sentimentality || 3,
        },
        interests: p.interests || [],
        exclusions: p.exclusions || [],
      }));

      const stats = await ApiService.recalculate({
        group_id: groupId,
        preferences,
      });
      
      setStatistics(stats);
    } catch (error) {
      console.error('Error calculating statistics:', error);
      alert('Failed to calculate statistics. Make sure the API is running at ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedRuleset || !groupId || !userId) {
      alert('Please select a ruleset');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to finalize the matching with ${selectedRuleset}? This will generate the final results for your group.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const prefs = await SupabaseService.getGroupPreferences(groupId);
      const preferences = prefs.map(p => ({
        user_id: p.user_id,
        giving_preferences: {
          practicality: p.giving_practicality || 3,
          novelty: p.giving_novelty || 3,
          sentimentality: p.giving_sentimentality || 3,
        },
        receiving_preferences: {
          practicality: p.receiving_practicality || 3,
          novelty: p.receiving_novelty || 3,
          sentimentality: p.receiving_sentimentality || 3,
        },
        interests: p.interests || [],
        exclusions: p.exclusions || [],
      }));

      const result = await ApiService.finalize({
        group_id: groupId,
        ruleset: selectedRuleset,
        preferences,
        seed: 42,
      });

      await SupabaseService.saveMatchResults({
        group_id: groupId,
        ruleset: selectedRuleset,
        pairings: result.pairings || null,
        play_order: result.play_order || null,
        statistics: statistics?.statistics || null,
        seed: 42,
        created_by: userId,
      });

      setResults(result);
      setSavedResults({
        ruleset: selectedRuleset,
        pairings: result.pairings,
        play_order: result.play_order,
        statistics: statistics?.statistics,
      });
    } catch (error) {
      console.error('Error finalizing:', error);
      alert('Failed to finalize matching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center">
        <Sidebar />
        <main className="ml-[200px] w-full">
          <p className="chalk-text text-pareto-light text-xl">Loading...</p>
        </main>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="flex bg-pareto-dark min-h-screen">
        <Sidebar />
        <main className="ml-[200px] w-full p-8">
          <h1 className="font-display text-4xl text-pareto-light mb-8">
            Results
          </h1>
          <div className="bg-white/10 rounded-lg p-8 max-w-2xl">
            <p className="chalk-text text-pareto-light text-lg">
              You're not part of a group yet.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // User view - show saved results
  if (!isAdmin && savedResults) {
    const userPairing = savedResults.pairings?.find((p: any) => p.giver === userId);
    const userPosition = savedResults.play_order?.indexOf(userId);

    return (
      <div className="flex bg-pareto-dark min-h-screen">
        <Sidebar />
        <main className="ml-[200px] w-full p-8">
          <header className="mb-8">
            <RainbowText 
              text="Your Match Results" 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
            <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
              Algorithm used: <span className="text-pareto-yellow">{savedResults.ruleset}</span>
            </p>
          </header>

          <div className="bg-white/10 rounded-2xl p-8 max-w-2xl">
            {userPairing && (
              <div>
                <h2 className="font-display text-3xl text-pareto-pink mb-6">
                  Secret Santa Match
                </h2>
                <div className="bg-pareto-pink/20 border-2 border-pareto-pink rounded-xl p-6">
                  <p className="chalk-text text-pareto-light text-lg mb-2">
                    You're giving a gift to:
                  </p>
                  <p className="font-display text-4xl text-pareto-pink">
                    {userPairing.receiver}
                  </p>
                  <p className="chalk-text text-pareto-light/60 text-sm mt-4">
                    Match quality score: {userPairing.utility.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {userPosition !== undefined && userPosition >= 0 && (
              <div>
                <h2 className="font-display text-3xl text-pareto-yellow mb-6">
                  White Elephant Order
                </h2>
                <div className="bg-pareto-yellow/20 border-2 border-pareto-yellow rounded-xl p-6">
                  <p className="chalk-text text-pareto-light text-lg mb-2">
                    You're picking:
                  </p>
                  <p className="font-display text-5xl text-pareto-yellow">
                    #{userPosition + 1}
                  </p>
                  <p className="chalk-text text-pareto-light/60 text-sm mt-4">
                    Out of {savedResults.play_order.length} participants
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // User view - no results yet
  if (!isAdmin) {
    return (
      <div className="flex bg-pareto-dark min-h-screen">
        <Sidebar />
        <main className="ml-[200px] w-full p-8">
          <header className="mb-8">
            <RainbowText 
              text="Results" 
              className="text-3xl sm:text-4xl md:text-5xl mb-3"
            />
          </header>

          <div className="bg-white/10 rounded-2xl p-8 max-w-2xl">
            <p className="chalk-text text-pareto-light text-lg mb-4">
              No results yet!
            </p>
            <p className="chalk-text text-pareto-light/80 text-base">
              Your group admin needs to finalize the matching. Check back soon!
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Admin view
  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />
      <main className="ml-[200px] w-full p-8">
        <header className="mb-8">
          <RainbowText 
            text="Admin: Run Algorithms" 
            className="text-3xl sm:text-4xl md:text-5xl mb-3"
          />
          <p className="chalk-text text-pareto-light/80 text-base sm:text-lg">
            Calculate statistics and choose the best matching algorithm for your group
          </p>
        </header>

        {/* Show saved results if they exist */}
        {savedResults && !statistics && !results && (
          <div className="bg-pareto-green/20 border border-pareto-green rounded-2xl p-6 mb-8 max-w-4xl">
            <h3 className="font-display text-2xl text-pareto-green mb-3">
              Results Already Finalized!
            </h3>
            <p className="chalk-text text-pareto-light text-base">
              You've already run the matching with <span className="text-pareto-yellow">{savedResults.ruleset}</span>.
              Calculate new statistics below if you want to re-run.
            </p>
          </div>
        )}

        {!statistics && !results && (
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="bg-pareto-orange text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Calculating...' : 'Calculate Statistics'}
          </button>
        )}

        {statistics && !results && (
          <div className="max-w-6xl space-y-6">
            <section className="bg-white/10 rounded-2xl p-8">
              <h2 className="font-display text-3xl text-pareto-yellow mb-6">
                Algorithm Comparison
              </h2>
              <p className="chalk-text text-pareto-light/80 text-base mb-6">
                Compare the performance of different matching algorithms:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-white/20">
                      <th className="text-left p-4 font-display text-pareto-pink text-lg">Algorithm</th>
                      <th className="text-left p-4 font-display text-pareto-yellow text-lg">Avg Utility</th>
                      <th className="text-left p-4 font-display text-pareto-orange text-lg">Min Utility</th>
                      <th className="text-left p-4 font-display text-pareto-green text-lg">Fairness</th>
                      <th className="text-center p-4 font-display text-pareto-blue text-lg">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.statistics.map((stat) => (
                      <tr 
                        key={stat.ruleset_name} 
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <span className="chalk-text text-pareto-light text-base font-semibold">
                            {stat.ruleset_name}
                          </span>
                        </td>
                        <td className="p-4 chalk-text text-pareto-light">
                          {stat.avg_utility.toFixed(2)}
                        </td>
                        <td className="p-4 chalk-text text-pareto-light">
                          {stat.min_utility.toFixed(2)}
                        </td>
                        <td className="p-4 chalk-text text-pareto-light">
                          {stat.fairness_score.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="radio"
                            name="ruleset"
                            value={stat.ruleset_name}
                            checked={selectedRuleset === stat.ruleset_name}
                            onChange={(e) => setSelectedRuleset(e.target.value)}
                            className="w-5 h-5 accent-pareto-blue cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-white/5 rounded-xl">
                <h3 className="font-display text-xl text-pareto-blue mb-3">
                  Understanding the Metrics:
                </h3>
                <ul className="space-y-2 chalk-text text-pareto-light/80 text-sm">
                  <li><strong>Avg Utility:</strong> Higher is better - overall match quality</li>
                  <li><strong>Min Utility:</strong> Higher is better - ensures no one gets a bad match</li>
                  <li><strong>Fairness Score:</strong> Lower is better - more equal distribution of happiness</li>
                </ul>
              </div>
            </section>

            <button
              onClick={handleFinalize}
              disabled={loading || !selectedRuleset}
              className="w-full max-w-md bg-pareto-green text-pareto-light px-8 py-4 rounded-xl font-display text-2xl hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Finalizing...' : 'Finalize Match'}
            </button>
          </div>
        )}

        {results && (
          <div className="max-w-6xl space-y-6">
            <section className="bg-white/10 rounded-2xl p-8">
              <h2 className="font-display text-3xl text-pareto-pink mb-6">
                Final Results - {results.ruleset}
              </h2>
              
              {results.pairings && (
                <div>
                  <h3 className="font-display text-2xl text-pareto-yellow mb-4">
                    Secret Santa Pairings:
                  </h3>
                  <div className="space-y-3">
                    {results.pairings.map((pairing, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <span className="chalk-text text-pareto-light">
                          {pairing.giver} → {pairing.receiver}
                        </span>
                        <span className="chalk-text text-pareto-light/60 text-sm">
                          utility: {pairing.utility.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.play_order && (
                <div>
                  <h3 className="font-display text-2xl text-pareto-yellow mb-4">
                    White Elephant Play Order:
                  </h3>
                  <ol className="space-y-3">
                    {results.play_order.map((userId, i) => (
                      <li 
                        key={i}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                      >
                        <span className="font-display text-2xl text-pareto-orange w-12">
                          #{i + 1}
                        </span>
                        <span className="chalk-text text-pareto-light">
                          {userId}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            <div className="bg-pareto-green/20 border border-pareto-green rounded-xl p-6">
              <p className="chalk-text text-pareto-light text-lg">
                ✓ Results have been saved! Group members can now view their matches.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}