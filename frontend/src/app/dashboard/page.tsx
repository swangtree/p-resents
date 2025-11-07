'use client'

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import HanddrawnButton from "@/components/HanddrawnButton";
import BlobBackground from "@/components/BlobBackground";

// Mock data - replace with actual data from your backend/database
const mockUser = {
  name: "Stefanie",
  isAdmin: true,
};

const mockGroup = {
  name: "Family Secret Santa 2025",
  code: "SANTA2025",
  members: [
    { id: 1, name: "Stefanie", avatar: "C", status: "missing", isAdmin: true },
    { id: 2, name: "Charlotte", avatar: "S", status: "submitted", isAdmin: false },
    { id: 3, name: "Samuel", avatar: "A", status: "missing", isAdmin: false },
    { id: 4, name: "Sam", avatar: "J", status: "submitted", isAdmin: false },
    { id: 5, name: "Cole", avatar: "S", status: "missing", isAdmin: false },
    { id: 6, name: "Justin", avatar: "J", status: "submitted", isAdmin: false },
    { id: 7, name: "Joanna", avatar: "J", status: "missing", isAdmin: false },
    { id: 8, name: "Liam", avatar: "L", status: "missing", isAdmin: false }
  ],
  deadline: "December 15, 2025",
  drawComplete: false
};

const greetings = [
  "Ready to spread some joy? 🎁",
  "Let's make gift giving magical! ✨",
  "Time to find the perfect presents! 🎉",
  "Gift giving made easier, together! 💝",
  "Your group is counting on you! 🌟"
];

const budgetOptions = ['$0-50', '$50-100', '$100-150', '$150-200', '$200+'];
const wishlistCategories = ['Electronics', 'Books', 'Clothing', 'Home Decor', 'Hobbies', 'Food & Drink', 'Experience', 'Other'];

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [preferences, setPreferences] = useState({
    budget: '$50-100',
    wishlist: [] as string[],
    notes: '',
    submitted: false
  });
  const [budgetExpanded, setBudgetExpanded] = useState(false);
  const [wishlistExpanded, setWishlistExpanded] = useState(false);
  const [randomGreeting] = useState(greetings[Math.floor(Math.random() * greetings.length)]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockGroup.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const progressPercentage = (mockGroup.members.filter(m => m.status === 'submitted').length / mockGroup.members.length) * 100;
  const submittedCount = mockGroup.members.filter(m => m.status === 'submitted').length;

  const toggleWishlistItem = (item: string) => {
    setPreferences(prev => ({
      ...prev,
      wishlist: prev.wishlist.includes(item)
        ? prev.wishlist.filter(i => i !== item)
        : [...prev.wishlist, item]
    }));
  };

  const submitPreferences = () => {
    setPreferences(prev => ({ ...prev, submitted: true }));
    setActiveView('overview');
  };

  return (
    <div className="flex bg-pareto-light min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[200px] w-full p-8">
        {/* Header */}
        <header className="mb-8 bg-white rounded-3xl shadow-lg p-6 border-4 border-text-dark">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-text-dark text-3xl mb-2">{mockGroup.name}</h2>
              <p className="font-sans text-gray-600">{randomGreeting}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-2xl">🔔</span>
                {!preferences.submitted && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pareto-pink rounded-full"></span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-pareto-pink rounded-full flex items-center justify-center text-white font-display text-xl">
                  {mockUser.name[0]}
                </div>
                <span className="font-display text-text-dark text-lg">{mockUser.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <HanddrawnButton
            text="Overview"
            fillColor={activeView === 'overview' ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView('overview')}
          />
          <HanddrawnButton
            text="My Preferences"
            fillColor={activeView === 'preferences' ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView('preferences')}
          />
          <HanddrawnButton
            text="Members"
            fillColor={activeView === 'members' ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView('members')}
          />
          {mockGroup.drawComplete && (
            <HanddrawnButton
              text="Results"
              fillColor={activeView === 'results' ? "#ff7eba" : "#f6f1ee"}
              borderColor="#2d3142"
              textColor="#2d3142"
              onClick={() => setActiveView('results')}
            />
          )}
          {mockUser.isAdmin && (
            <HanddrawnButton
              text="Admin Settings"
              fillColor={activeView === 'settings' ? "#ff7eba" : "#f6f1ee"}
              borderColor="#2d3142"
              textColor="#2d3142"
              onClick={() => setActiveView('settings')}
            />
          )}
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Alert */}
            {!preferences.submitted && (
              <div className="bg-pareto-yellow border-4 border-text-dark rounded-3xl p-6 flex items-start gap-4">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-display text-text-dark text-2xl mb-2">You haven&apos;t finished your wishlist!</h3>
                  <p className="font-sans text-text-dark mb-4">Complete your preferences so your Secret Santa knows what to get you.</p>
                  <HanddrawnButton
                    text="Complete Preferences"
                    fillColor="#f59e0b"
                    borderColor="#2d3142"
                    textColor="#f6f1ee"
                    onClick={() => setActiveView('preferences')}
                  />
                </div>
              </div>
            )}

            {/* Invite Card */}
            <div className="bg-pareto-pink rounded-3xl border-4 border-text-dark shadow-lg p-6 relative overflow-hidden">
              <BlobBackground fillColor="#ff9ed4" />
              <div className="relative z-10">
                <h3 className="font-display text-white text-2xl mb-4">Invite Friends to Join!</h3>
                <div className="bg-white/20 backdrop-blur rounded-2xl border-2 border-white/40 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-sans text-white text-sm mb-1">Group Code</p>
                    <p className="font-display text-white text-3xl tracking-wider">{mockGroup.code}</p>
                  </div>
                  <HanddrawnButton
                    text={copiedCode ? "Copied!" : "Copy"}
                    fillColor="#f6f1ee"
                    borderColor="#2d3142"
                    textColor="#2d3142"
                    onClick={handleCopyCode}
                  />
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-2xl mb-4">Group Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-gray-600">Members who submitted preferences</span>
                  <span className="font-display text-text-dark text-xl">
                    {submittedCount} / {mockGroup.members.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border-2 border-text-dark">
                  <div
                    className="h-full bg-pareto-green transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="font-sans text-sm text-gray-600">Deadline: {mockGroup.deadline}</p>
              </div>
            </div>

            {/* My Preferences Summary */}
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-text-dark text-2xl">My Preferences Overview</h3>
                <HanddrawnButton
                  text="Edit"
                  fillColor="#ff7eba"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => setActiveView('preferences')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4">
                  <p className="font-sans text-sm text-gray-600 mb-1">Budget Range</p>
                  <p className="font-display text-text-dark text-xl">{preferences.budget}</p>
                </div>
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4">
                  <p className="font-sans text-sm text-gray-600 mb-1">Wishlist Items</p>
                  <p className="font-display text-text-dark text-xl">{preferences.wishlist.length} categories</p>
                </div>
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4 col-span-2">
                  <p className="font-sans text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {preferences.submitted ? (
                      <span className="font-display text-pareto-green text-lg">✓ Submitted</span>
                    ) : (
                      <span className="font-display text-yellow-600 text-lg">⚠ Not Submitted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences View */}
        {activeView === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-3xl mb-6">My Preferences</h3>

              {/* Budget Selection */}
              <div className="mb-6">
                <label className="block font-display text-text-dark text-xl mb-3">Budget Range</label>
                <button
                  onClick={() => setBudgetExpanded(!budgetExpanded)}
                  className="w-full bg-pareto-light border-3 border-text-dark rounded-2xl p-4 flex items-center justify-between hover:bg-pareto-yellow transition-colors font-sans"
                >
                  <span className="font-display text-lg">{preferences.budget}</span>
                  <span className="text-xl">{budgetExpanded ? '▼' : '▶'}</span>
                </button>
                {budgetExpanded && (
                  <div className="mt-2 bg-pareto-light border-3 border-text-dark rounded-2xl p-2 space-y-2">
                    {budgetOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setPreferences({ ...preferences, budget: option });
                          setBudgetExpanded(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-display text-lg ${
                          preferences.budget === option
                            ? 'bg-pareto-pink text-white border-2 border-text-dark'
                            : 'hover:bg-pareto-yellow'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Categories */}
              <div className="mb-6">
                <label className="block font-display text-text-dark text-xl mb-3">
                  Wishlist Categories ({preferences.wishlist.length} selected)
                </label>
                <button
                  onClick={() => setWishlistExpanded(!wishlistExpanded)}
                  className="w-full bg-pareto-light border-3 border-text-dark rounded-2xl p-4 flex items-center justify-between hover:bg-pareto-yellow transition-colors font-sans"
                >
                  <span className="font-display text-lg">Select categories you&apos;re interested in</span>
                  <span className="text-xl">{wishlistExpanded ? '▼' : '▶'}</span>
                </button>
                {wishlistExpanded && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {wishlistCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleWishlistItem(category)}
                        className={`px-4 py-3 rounded-xl border-3 border-text-dark transition-all font-display text-lg ${
                          preferences.wishlist.includes(category)
                            ? 'bg-pareto-pink text-white'
                            : 'bg-white hover:bg-pareto-yellow'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block font-display text-text-dark text-xl mb-3">
                  What else do you want to tell your gifter?
                </label>
                <textarea
                  value={preferences.notes}
                  onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                  placeholder="Any specific items, sizes, colors, or preferences your Secret Santa should know about..."
                  className="w-full h-32 p-4 border-3 border-text-dark rounded-2xl focus:border-pareto-pink focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Submit Button */}
              <HanddrawnButton
                text="Submit Preferences"
                fillColor="#39b16c"
                borderColor="#2d3142"
                textColor="#f6f1ee"
                onClick={submitPreferences}
              />
            </div>
          </div>
        )}

        {/* Members View */}
        {activeView === 'members' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-3xl mb-6">Group Members</h3>
              <div className="space-y-3">
                {mockGroup.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-pareto-light rounded-2xl border-2 border-text-dark hover:bg-pareto-yellow transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-xl border-2 border-text-dark ${
                        member.status === 'submitted' ? 'bg-pareto-green' : 'bg-gray-400'
                      }`}>
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-text-dark text-lg">{member.name}</p>
                          {member.isAdmin && (
                            <span className="bg-pareto-pink text-white text-xs px-2 py-1 rounded-full border border-text-dark font-sans">Admin</span>
                          )}
                        </div>
                        <p className={`font-sans text-sm ${
                          member.status === 'submitted' ? 'text-pareto-green' : 'text-yellow-600'
                        }`}>
                          {member.status === 'submitted' ? '✓ Submitted' : '⚠ Missing preferences'}
                        </p>
                      </div>
                    </div>
                    {mockUser.isAdmin && !member.isAdmin && (
                      <button className="text-red-500 hover:text-red-700 p-2 text-xl">
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {mockUser.isAdmin && (
                <div className="mt-4">
                  <HanddrawnButton
                    text="+ Add Member"
                    fillColor="#ff7eba"
                    borderColor="#2d3142"
                    textColor="#f6f1ee"
                    onClick={() => alert('Add member functionality')}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Settings View */}
        {activeView === 'settings' && mockUser.isAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-3xl mb-6">Admin Controls</h3>
              
              <div className="space-y-4">
                <HanddrawnButton
                  text="📤 Send Reminders to Members"
                  fillColor="#3b82f6"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => alert('Send reminders')}
                />
                <HanddrawnButton
                  text="🔒 Lock Group & Run Draw"
                  fillColor="#f59e0b"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => alert('Lock and run draw')}
                />
                <HanddrawnButton
                  text="🔀 Manual Pair Assignment"
                  fillColor="#8b5cf6"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => alert('Manual pairing')}
                />
                <HanddrawnButton
                  text="🏆 View Results Review"
                  fillColor="#39b16c"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => alert('View results')}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-2xl mb-4">Draw Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">Deadline</label>
                  <input
                    type="date"
                    className="w-full p-3 border-3 border-text-dark rounded-xl focus:border-pareto-pink focus:outline-none font-sans"
                    defaultValue="2025-12-15"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">Budget Limits</label>
                  <input
                    type="text"
                    className="w-full p-3 border-3 border-text-dark rounded-xl focus:border-pareto-pink focus:outline-none font-sans"
                    defaultValue="$50-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {activeView === 'results' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-12 text-center">
              {mockGroup.drawComplete ? (
                <>
                  <span className="text-6xl mb-4 block">🏆</span>
                  <h3 className="font-display text-text-dark text-3xl mb-4">Your Secret Santa Match!</h3>
                  <p className="font-sans text-gray-600">Results will appear here after the draw is complete.</p>
                </>
              ) : (
                <>
                  <span className="text-6xl mb-4 block opacity-50">🔒</span>
                  <h3 className="font-display text-text-dark text-3xl mb-4">Results Not Available Yet</h3>
                  <p className="font-sans text-gray-600">The admin needs to run the draw first. Check back soon!</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}