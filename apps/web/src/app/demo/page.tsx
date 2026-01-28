'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RainbowText from '@/components/RainbowText';
import HanddrawnButton from '@/components/HanddrawnButton';
import { RulesetStatistics, Pairing } from '@/types/api.types';

// Demo data for 8 team members with varied preferences
const DEMO_MEMBERS = [
  { id: 'alice', name: 'Alice', interests: ['hiking', 'cooking', 'photography'] },
  { id: 'bob', name: 'Bob', interests: ['gaming', 'tech gadgets', 'sci-fi'] },
  { id: 'carol', name: 'Carol', interests: ['reading', 'tea', 'gardening'] },
  { id: 'david', name: 'David', interests: ['sports', 'grilling', 'craft beer'] },
  { id: 'emma', name: 'Emma', interests: ['art', 'music', 'yoga'] },
  { id: 'frank', name: 'Frank', interests: ['woodworking', 'camping', 'coffee'] },
  { id: 'grace', name: 'Grace', interests: ['baking', 'movies', 'travel'] },
  { id: 'henry', name: 'Henry', interests: ['puzzles', 'board games', 'astronomy'] },
];

// Pre-calculated algorithm statistics (simulating API response)
const DEMO_STATISTICS: RulesetStatistics[] = [
  {
    ruleset_name: 'Random Matching',
    avg_utility: 5.23,
    min_utility: 2.10,
    max_utility: 8.40,
    std_utility: 2.15,
    fairness_score: 4.12,
  },
  {
    ruleset_name: 'Max Utility (Hungarian)',
    avg_utility: 7.89,
    min_utility: 5.80,
    max_utility: 9.20,
    std_utility: 1.02,
    fairness_score: 1.29,
  },
  {
    ruleset_name: 'Max Fairness',
    avg_utility: 7.12,
    min_utility: 6.90,
    max_utility: 7.35,
    std_utility: 0.15,
    fairness_score: 0.21,
  },
  {
    ruleset_name: 'White Elephant Simulation',
    avg_utility: 6.45,
    min_utility: 3.20,
    max_utility: 9.10,
    std_utility: 1.85,
    fairness_score: 2.87,
    expected_happiness: 6.8,
  },
];

// Sample Secret Santa pairings with Max Utility algorithm
const DEMO_PAIRINGS: Pairing[] = [
  { giver: 'Alice', receiver: 'Henry', utility: 8.5 },
  { giver: 'Bob', receiver: 'Frank', utility: 7.2 },
  { giver: 'Carol', receiver: 'Emma', utility: 8.9 },
  { giver: 'David', receiver: 'Bob', utility: 7.8 },
  { giver: 'Emma', receiver: 'Carol', utility: 9.2 },
  { giver: 'Frank', receiver: 'David', utility: 8.1 },
  { giver: 'Grace', receiver: 'Alice', utility: 7.5 },
  { giver: 'Henry', receiver: 'Grace', utility: 8.0 },
];

// Sample White Elephant play order
const DEMO_PLAY_ORDER = ['Grace', 'David', 'Alice', 'Frank', 'Carol', 'Henry', 'Emma', 'Bob'];

// White Elephant simulation statistics
const DEMO_WE_STATS = {
  avgStealsPerGame: 4.2,
  maxStealsObserved: 12,
  simulationsRun: 1000,
  userStats: [
    { name: 'Alice', avgUtility: 6.8, timesStolen: '32%', timesStealing: '45%' },
    { name: 'Bob', avgUtility: 7.1, timesStolen: '28%', timesStealing: '38%' },
    { name: 'Carol', avgUtility: 6.2, timesStolen: '41%', timesStealing: '22%' },
    { name: 'David', avgUtility: 7.4, timesStolen: '25%', timesStealing: '52%' },
    { name: 'Emma', avgUtility: 5.9, timesStolen: '48%', timesStealing: '18%' },
    { name: 'Frank', avgUtility: 6.5, timesStolen: '35%', timesStealing: '40%' },
    { name: 'Grace', avgUtility: 7.8, timesStolen: '18%', timesStealing: '55%' },
    { name: 'Henry', avgUtility: 5.8, timesStolen: '52%', timesStealing: '15%' },
  ],
};

export default function DemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'secret-santa' | 'white-elephant'>('secret-santa');

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />
      <main className="ml-[200px] w-full p-8">
        {/* Header */}
        <header className="mb-8">
          <RainbowText
            text="Demo: See It In Action"
            className="text-3xl sm:text-4xl md:text-5xl mb-3"
          />
          <p className="chalk-text text-pareto-light/80 text-base sm:text-lg max-w-3xl">
            Explore how Pareto Presents works with sample data from an 8-person gift exchange.
            No login required - see the algorithms in action!
          </p>
        </header>

        {/* Demo Group Info */}
        <section className="bg-white/10 rounded-2xl p-6 mb-8 max-w-4xl">
          <h2 className="font-display text-2xl text-pareto-pink mb-4">
            Demo Group: &quot;The Office Holiday Party&quot;
          </h2>
          <p className="chalk-text text-pareto-light/80 text-sm mb-4">
            8 coworkers with different gift-giving styles and preferences:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEMO_MEMBERS.map((member) => (
              <div key={member.id} className="bg-white/5 rounded-lg p-3">
                <p className="font-display text-pareto-yellow text-lg">{member.name}</p>
                <p className="chalk-text text-pareto-light/60 text-xs">
                  {member.interests.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Algorithm Comparison Table */}
        <section className="bg-white/10 rounded-2xl p-8 mb-8 max-w-6xl">
          <h2 className="font-display text-3xl text-pareto-yellow mb-6">
            Algorithm Comparison
          </h2>
          <p className="chalk-text text-pareto-light/80 text-base mb-6">
            Here&apos;s how different algorithms perform on this group&apos;s preferences:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white/20">
                  <th className="text-left p-4 font-display text-pareto-pink text-lg">Algorithm</th>
                  <th className="text-left p-4 font-display text-pareto-yellow text-lg">Avg Utility</th>
                  <th className="text-left p-4 font-display text-pareto-orange text-lg">Min Utility</th>
                  <th className="text-left p-4 font-display text-pareto-blue text-lg">Max Utility</th>
                  <th className="text-left p-4 font-display text-pareto-green text-lg">Fairness</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_STATISTICS.map((stat) => (
                  <tr
                    key={stat.ruleset_name}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="chalk-text text-pareto-light text-base font-semibold">
                        {stat.ruleset_name}
                      </span>
                      {stat.expected_happiness && (
                        <span className="block text-pareto-light/60 text-xs mt-1">
                          Expected happiness: {stat.expected_happiness.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 chalk-text text-pareto-light">
                      {stat.avg_utility.toFixed(2)}
                    </td>
                    <td className="p-4 chalk-text text-pareto-light">
                      {stat.min_utility.toFixed(2)}
                    </td>
                    <td className="p-4 chalk-text text-pareto-light">
                      {stat.max_utility.toFixed(2)}
                    </td>
                    <td className="p-4 chalk-text text-pareto-light">
                      {stat.fairness_score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-white/5 rounded-xl">
            <h3 className="font-display text-xl text-pareto-blue mb-3">
              Understanding the Metrics
            </h3>
            <ul className="space-y-2 chalk-text text-pareto-light/80 text-sm">
              <li><strong className="text-pareto-yellow">Avg Utility:</strong> Higher is better - overall match quality across all participants</li>
              <li><strong className="text-pareto-orange">Min Utility:</strong> Higher is better - ensures no one gets a terrible match</li>
              <li><strong className="text-pareto-blue">Max Utility:</strong> The best individual match score achieved</li>
              <li><strong className="text-pareto-green">Fairness Score:</strong> Lower is better - measures equality of happiness distribution</li>
            </ul>
          </div>
        </section>

        {/* Mode Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('secret-santa')}
            className={`px-6 py-3 rounded-xl font-display text-xl transition-all ${
              activeTab === 'secret-santa'
                ? 'bg-pareto-pink text-pareto-light'
                : 'bg-white/10 text-pareto-light/60 hover:bg-white/20'
            }`}
          >
            Secret Santa Results
          </button>
          <button
            onClick={() => setActiveTab('white-elephant')}
            className={`px-6 py-3 rounded-xl font-display text-xl transition-all ${
              activeTab === 'white-elephant'
                ? 'bg-pareto-yellow text-text-dark'
                : 'bg-white/10 text-pareto-light/60 hover:bg-white/20'
            }`}
          >
            White Elephant Results
          </button>
        </div>

        {/* Secret Santa Results */}
        {activeTab === 'secret-santa' && (
          <section className="bg-white/10 rounded-2xl p-8 max-w-4xl">
            <h2 className="font-display text-3xl text-pareto-pink mb-2">
              Secret Santa Pairings
            </h2>
            <p className="chalk-text text-pareto-light/60 text-sm mb-6">
              Using Max Utility (Hungarian) algorithm - optimizes for best overall matches
            </p>

            <div className="space-y-3">
              {DEMO_PAIRINGS.map((pairing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="chalk-text text-pareto-pink font-semibold">
                      {pairing.giver}
                    </span>
                    <span className="text-pareto-light/40">→</span>
                    <span className="chalk-text text-pareto-yellow font-semibold">
                      {pairing.receiver}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chalk-text text-pareto-light/60 text-sm">
                      match score:
                    </span>
                    <span className={`chalk-text font-semibold ${
                      pairing.utility >= 8 ? 'text-pareto-green' :
                      pairing.utility >= 7 ? 'text-pareto-yellow' :
                      'text-pareto-orange'
                    }`}>
                      {pairing.utility.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-pareto-green/20 border border-pareto-green rounded-xl">
              <p className="chalk-text text-pareto-light text-sm">
                <strong>Group Average:</strong> 8.15 utility score | <strong>Fairness:</strong> 1.29 (excellent equality)
              </p>
            </div>
          </section>
        )}

        {/* White Elephant Results */}
        {activeTab === 'white-elephant' && (
          <section className="space-y-6 max-w-6xl">
            <div className="bg-white/10 rounded-2xl p-8">
              <h2 className="font-display text-3xl text-pareto-yellow mb-2">
                White Elephant Play Order
              </h2>
              <p className="chalk-text text-pareto-light/60 text-sm mb-6">
                Randomized order for gift selection - based on 1,000 Monte Carlo simulations
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DEMO_PLAY_ORDER.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                  >
                    <span className="font-display text-3xl text-pareto-orange w-12">
                      #{i + 1}
                    </span>
                    <span className="chalk-text text-pareto-light text-lg">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-8">
              <h3 className="font-display text-2xl text-pareto-orange mb-4">
                Simulation Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="font-display text-3xl text-pareto-yellow">
                    {DEMO_WE_STATS.avgStealsPerGame}
                  </p>
                  <p className="chalk-text text-pareto-light/60 text-sm">Avg steals per game</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="font-display text-3xl text-pareto-pink">
                    {DEMO_WE_STATS.maxStealsObserved}
                  </p>
                  <p className="chalk-text text-pareto-light/60 text-sm">Max steals observed</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="font-display text-3xl text-pareto-green">
                    {DEMO_WE_STATS.simulationsRun.toLocaleString()}
                  </p>
                  <p className="chalk-text text-pareto-light/60 text-sm">Simulations run</p>
                </div>
              </div>

              <h4 className="font-display text-xl text-pareto-blue mb-3">
                Per-Player Statistics
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3 chalk-text text-pareto-light/80 text-sm">Player</th>
                      <th className="text-left p-3 chalk-text text-pareto-light/80 text-sm">Avg Utility</th>
                      <th className="text-left p-3 chalk-text text-pareto-light/80 text-sm">Times Stolen From</th>
                      <th className="text-left p-3 chalk-text text-pareto-light/80 text-sm">Times Stealing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_WE_STATS.userStats.map((stat) => (
                      <tr key={stat.name} className="border-b border-white/5">
                        <td className="p-3 chalk-text text-pareto-yellow">{stat.name}</td>
                        <td className="p-3 chalk-text text-pareto-light">{stat.avgUtility.toFixed(1)}</td>
                        <td className="p-3 chalk-text text-pareto-pink">{stat.timesStolen}</td>
                        <td className="p-3 chalk-text text-pareto-green">{stat.timesStealing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-12 bg-gradient-to-r from-pareto-pink/20 to-pareto-yellow/20 rounded-2xl p-8 max-w-4xl">
          <h2 className="font-display text-3xl text-pareto-light mb-4">
            Ready to try it with your group?
          </h2>
          <p className="chalk-text text-pareto-light/80 text-base mb-6">
            Create a group, invite your friends, and let our algorithms find the perfect matches for your gift exchange!
          </p>
          <div className="flex gap-4">
            <HanddrawnButton
              text="Sign Up Free"
              fillColor="#39b16c"
              borderColor="#f6f1ee"
              textColor="#f6f1ee"
              onClick={() => router.push('/login')}
            />
            <HanddrawnButton
              text="Learn More"
              fillColor="#6caade"
              borderColor="#f6f1ee"
              textColor="#f6f1ee"
              onClick={() => router.push('/about')}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
