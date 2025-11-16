'use client';

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HanddrawnButton from "@/components/HanddrawnButton";
import BlobBackground from "@/components/BlobBackground";

type MemberStatus = "missing" | "submitted";

type Member = {
  id: number;
  name: string;
  avatar: string;
  status: MemberStatus;
  isAdmin: boolean;
};

// Mock data - replace with actual data from your backend/database
const mockUser = {
  id: 1,
  name: "Stefanie",
  isAdmin: true,
};

const mockGroup = {
  name: "Family Secret Santa 2025",
  code: "SANTA2025",
  members: [
    { id: 1, name: "Stefanie", avatar: "C", status: "missing" as MemberStatus, isAdmin: true },
    { id: 2, name: "Charlotte", avatar: "S", status: "submitted" as MemberStatus, isAdmin: false },
    { id: 3, name: "Samuel", avatar: "A", status: "missing" as MemberStatus, isAdmin: false },
    { id: 4, name: "Sam", avatar: "J", status: "submitted" as MemberStatus, isAdmin: false },
    { id: 5, name: "Cole", avatar: "S", status: "missing" as MemberStatus, isAdmin: false },
    { id: 6, name: "Justin", avatar: "J", status: "submitted" as MemberStatus, isAdmin: false },
    { id: 7, name: "Joanna", avatar: "J", status: "missing" as MemberStatus, isAdmin: false },
    { id: 8, name: "Liam", avatar: "L", status: "missing" as MemberStatus, isAdmin: false },
  ],
  deadline: "December 15, 2025",
  drawComplete: false,
};

const greetings = [
  "Ready to spread some joy? 🎁",
  "Let's make gift giving magical! ✨",
  "Time to find the perfect presents! 🎉",
  "Gift giving made easier, together! 💝",
  "Your group is counting on you! 🌟",
];

const budgetOptions = ["$0-50", "$50-100", "$100-150", "$150-200", "$200+"];
const wishlistCategories = [
  "Electronics",
  "Books",
  "Clothing",
  "Home Decor",
  "Hobbies",
  "Food & Drink",
  "Experience",
  "Other",
];

const mockNotifications = [
  { id: 1, message: "Charlotte just submitted her wishlist.", time: "2h ago" },
  { id: 2, message: "Group deadline updated to December 15, 2025.", time: "1d ago" },
];

const mockAssignments = [
  { giverId: 1, receiverId: 2 },
  { giverId: 2, receiverId: 3 },
  { giverId: 3, receiverId: 4 },
  { giverId: 4, receiverId: 5 },
  { giverId: 5, receiverId: 6 },
  { giverId: 6, receiverId: 7 },
  { giverId: 7, receiverId: 8 },
  { giverId: 8, receiverId: 1 },
];

const MAX_NOTES_LENGTH = 300;

type View = "overview" | "preferences" | "members" | "settings" | "results";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [preferences, setPreferences] = useState({
    budget: "$50-100",
    wishlist: [] as string[],
    notes: "",
    submitted: false,
  });
  const [budgetExpanded, setBudgetExpanded] = useState(false);
  const [wishlistExpanded, setWishlistExpanded] = useState(false);
  const [randomGreeting] = useState(
    greetings[Math.floor(Math.random() * greetings.length)]
  );
  const [drawComplete, setDrawComplete] = useState(mockGroup.drawComplete);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(mockNotifications.length);

  const [members, setMembers] = useState<Member[]>(mockGroup.members);

  const [memberFilter, setMemberFilter] = useState<"all" | "submitted" | "missing">(
    "all"
  );
  const [memberSearch, setMemberSearch] = useState("");

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberIsAdmin, setNewMemberIsAdmin] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // NEW: admin-control feature windows
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showLockDrawModal, setShowLockDrawModal] = useState(false);
  const [showManualPairModal, setShowManualPairModal] = useState(false);
  const [showResultsReviewModal, setShowResultsReviewModal] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockGroup.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const submittedCount = members.filter((m) => m.status === "submitted").length;
  const progressPercentage = (submittedCount / members.length) * 100;
  const missingCount = members.length - submittedCount;

  // Deadline countdown
  const deadlineDate = new Date(mockGroup.deadline);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeftRaw = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / msPerDay
  );
  const daysLeft = daysLeftRaw > 0 ? daysLeftRaw : 0;

  const toggleWishlistItem = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(item)
        ? prev.wishlist.filter((i) => i !== item)
        : [...prev.wishlist, item],
    }));
  };

  const submitPreferences = () => {
    setPreferences((prev) => ({ ...prev, submitted: true }));
    setActiveView("overview");
  };

  const notesRemaining = MAX_NOTES_LENGTH - preferences.notes.length;

  const filteredMembers = members.filter((member) => {
    const matchesStatus =
      memberFilter === "all" ||
      (memberFilter === "submitted" && member.status === "submitted") ||
      (memberFilter === "missing" && member.status === "missing");

    const matchesSearch = member.name
      .toLowerCase()
      .includes(memberSearch.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const myAssignment = mockAssignments.find(
    (assignment) => assignment.giverId === mockUser.id
  );
  const myRecipient = members.find(
    (member) => member.id === myAssignment?.receiverId
  );

  const openDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    }
    setMemberToDelete(null);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setMemberToDelete(null);
    setShowDeleteModal(false);
  };

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) {
      alert("Please enter a name.");
      return;
    }
    const newId =
      members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
    const avatar = name[0].toUpperCase();
    const newMember: Member = {
      id: newId,
      name,
      avatar,
      status: "missing",
      isAdmin: newMemberIsAdmin,
    };
    setMembers((prev) => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberIsAdmin(false);
    setShowAddMemberModal(false);
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setNewMemberName("");
    setNewMemberIsAdmin(false);
  };

  return (
    <div className="flex bg-pareto-light min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[200px] w-full p-8 relative">
        {/* Header */}
        <header className="mb-8 bg-white rounded-3xl shadow-lg p-6 border-4 border-text-dark">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-text-dark text-3xl mb-2">
                {mockGroup.name}
              </h2>
              <p className="font-sans text-gray-600">{randomGreeting}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="relative p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    setShowNotifications((prev) => !prev);
                    setUnreadCount(0);
                  }}
                >
                  <span className="text-2xl">🔔</span>
                  {(!preferences.submitted || unreadCount > 0) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-pareto-pink rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-text-dark rounded-2xl shadow-lg z-20 p-4">
                    <p className="font-display text-text-dark text-lg mb-3">
                      Notifications
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mockNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-xl bg-pareto-light border border-text-dark/20"
                        >
                          <p className="font-sans text-sm text-text-dark">
                            {n.message}
                          </p>
                          <p className="font-sans text-xs text-gray-500 mt-1">
                            {n.time}
                          </p>
                        </div>
                      ))}
                      {mockNotifications.length === 0 && (
                        <p className="font-sans text-sm text-gray-500">
                          You&apos;re all caught up!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-pareto-pink rounded-full flex items-center justify-center text-white font-display text-xl">
                  {mockUser.name[0]}
                </div>
                <span className="font-display text-text-dark text-lg">
                  {mockUser.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <HanddrawnButton
            text="Overview"
            fillColor={activeView === "overview" ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView("overview")}
          />
          <HanddrawnButton
            text="My Preferences"
            fillColor={activeView === "preferences" ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView("preferences")}
          />
          <HanddrawnButton
            text="Members"
            fillColor={activeView === "members" ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor="#2d3142"
            onClick={() => setActiveView("members")}
          />
          <HanddrawnButton
            text="Results"
            fillColor={activeView === "results" ? "#ff7eba" : "#f6f1ee"}
            borderColor="#2d3142"
            textColor={drawComplete ? "#2d3142" : "#9ca3af"}
            onClick={() => setActiveView("results")}
          />
          {mockUser.isAdmin && (
            <HanddrawnButton
              text="Admin Settings"
              fillColor={activeView === "settings" ? "#ff7eba" : "#f6f1ee"}
              borderColor="#2d3142"
              textColor="#2d3142"
              onClick={() => setActiveView("settings")}
            />
          )}
        </div>

        {/* Overview View */}
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* Alert */}
            {!preferences.submitted && (
              <div className="bg-pareto-yellow border-4 border-text-dark rounded-3xl p-6 flex items-start gap-4">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-display text-text-dark text-2xl mb-2">
                    You haven&apos;t finished your wishlist!
                  </h3>
                  <p className="font-sans text-text-dark mb-4">
                    Complete your preferences so your Secret Santa knows what to
                    get you.
                  </p>
                  <HanddrawnButton
                    text="Complete Preferences"
                    fillColor="#f59e0b"
                    borderColor="#2d3142"
                    textColor="#f6f1ee"
                    onClick={() => setActiveView("preferences")}
                  />
                </div>
              </div>
            )}

            {/* Invite Card */}
            <div className="bg-pareto-pink rounded-3xl border-4 border-text-dark shadow-lg p-6 relative overflow-hidden">
              <BlobBackground fillColor="#ff9ed4" />
              <div className="relative z-10">
                <h3 className="font-display text-white text-2xl mb-4">
                  Invite Friends to Join!
                </h3>
                <div className="bg-white/20 backdrop-blur rounded-2xl border-2 border-white/40 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-sans text-white text-sm mb-1">Group Code</p>
                    <p className="font-display text-white text-3xl tracking-wider">
                      {mockGroup.code}
                    </p>
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
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Group Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-gray-600">
                    Members who submitted preferences
                  </span>
                  <span className="font-display text-text-dark text-xl">
                    {submittedCount} / {members.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border-2 border-text-dark">
                  <div
                    className="h-full bg-pareto-green transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="font-sans text-sm text-gray-600">
                  Deadline: {mockGroup.deadline}{" "}
                  <span className="font-semibold">
                    {daysLeft === 0
                      ? "• Deadline passed"
                      : `• ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                  </span>
                </p>
              </div>
            </div>

            {/* My Preferences Summary */}
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-text-dark text-2xl">
                  My Preferences Overview
                </h3>
                <HanddrawnButton
                  text="Edit"
                  fillColor="#ff7eba"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => setActiveView("preferences")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4">
                  <p className="font-sans text-sm text-gray-600 mb-1">
                    Budget Range
                  </p>
                  <p className="font-display text-text-dark text-xl">
                    {preferences.budget}
                  </p>
                </div>
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4">
                  <p className="font-sans text-sm text-gray-600 mb-1">
                    Wishlist Items
                  </p>
                  <p className="font-display text-text-dark text-xl">
                    {preferences.wishlist.length} categories
                  </p>
                </div>
                <div className="bg-pareto-light rounded-2xl border-2 border-text-dark p-4 col-span-2">
                  <p className="font-sans text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {preferences.submitted ? (
                      <span className="font-display text-pareto-green text-lg">
                        ✓ Submitted
                      </span>
                    ) : (
                      <span className="font-display text-yellow-600 text-lg">
                        ⚠ Not Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps / Timeline */}
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-2xl mb-3">
                What Happens Next?
              </h3>
              <ol className="list-decimal list-inside space-y-1 font-sans text-gray-700">
                <li>Everyone joins the group using the code and submits preferences.</li>
                <li>The admin locks the group and runs the draw.</li>
                <li>
                  You&apos;ll see who you&apos;re gifting to in the{" "}
                  <span className="font-semibold">Results</span> tab.
                </li>
                <li>Use their wishlist to pick a gift within the budget.</li>
                <li>Exchange gifts and enjoy the chaos. 🎄</li>
              </ol>
            </div>
          </div>
        )}

        {/* Preferences View */}
        {activeView === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-3xl mb-6">
                My Preferences
              </h3>

              {/* Budget Selection */}
              <div className="mb-6">
                <label className="block font-display text-text-dark text-xl mb-3">
                  Budget Range
                </label>
                <button
                  onClick={() => setBudgetExpanded(!budgetExpanded)}
                  className="w-full bg-pareto-light border-3 border-text-dark rounded-2xl p-4 flex items-center justify-between hover:bg-pareto-yellow transition-colors font-sans"
                >
                  <span className="font-display text-lg">
                    {preferences.budget}
                  </span>
                  <span className="text-xl">
                    {budgetExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {budgetExpanded && (
                  <div className="mt-2 bg-pareto-light border-3 border-text-dark rounded-2xl p-2 space-y-2">
                    {budgetOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setPreferences({ ...preferences, budget: option });
                          setBudgetExpanded(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-display text-lg ${
                          preferences.budget === option
                            ? "bg-pareto-pink text-white border-2 border-text-dark"
                            : "hover:bg-pareto-yellow"
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
                  <span className="font-display text-lg">
                    Select categories you&apos;re interested in
                  </span>
                  <span className="text-xl">
                    {wishlistExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {wishlistExpanded && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {wishlistCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleWishlistItem(category)}
                        className={`px-4 py-3 rounded-xl border-3 border-text-dark transition-all font-display text-lg ${
                          preferences.wishlist.includes(category)
                            ? "bg-pareto-pink text-white"
                            : "bg-white hover:bg-pareto-yellow"
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
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notes: e.target.value.slice(0, MAX_NOTES_LENGTH),
                    })
                  }
                  placeholder="Any specific items, sizes, colors, or preferences your Secret Santa should know about..."
                  className="w-full h-32 p-4 border-3 border-text-dark rounded-2xl focus:border-pareto-pink focus:outline-none resize-none font-sans"
                />
                <p className="font-sans text-xs text-gray-500 text-right mt-1">
                  {notesRemaining} characters left
                </p>
              </div>

              {/* Submit + reset */}
              <HanddrawnButton
                text="Submit Preferences"
                fillColor="#39b16c"
                borderColor="#2d3142"
                textColor="#f6f1ee"
                onClick={submitPreferences}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-sans text-sm text-gray-500">
                  {preferences.submitted
                    ? "Preferences submitted. You can still edit them until the deadline."
                    : "You can adjust these anytime before submitting."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences({
                      budget: "$50-100",
                      wishlist: [],
                      notes: "",
                      submitted: false,
                    })
                  }
                  className="font-sans text-sm underline text-gray-500 hover:text-gray-700"
                >
                  Reset form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members View */}
        {activeView === "members" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-3xl mb-6">
                Group Members
              </h3>

              {/* Filters + search */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex gap-2">
                  {(["all", "submitted", "missing"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setMemberFilter(filterKey)}
                      className={`px-3 py-1 rounded-full border border-text-dark text-sm font-sans transition-colors ${
                        memberFilter === filterKey
                          ? "bg-pareto-pink text-white"
                          : "bg-pareto-light hover:bg-pareto-yellow"
                      }`}
                    >
                      {filterKey === "all"
                        ? "All"
                        : filterKey === "submitted"
                        ? "Submitted"
                        : "Missing"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="px-3 py-2 rounded-xl border-2 border-text-dark font-sans text-sm focus:outline-none focus:border-pareto-pink bg-pareto-light"
                  />
                  {mockUser.isAdmin && (
                    <HanddrawnButton
                      text="+ Add Member"
                      fillColor="#ff7eba"
                      borderColor="#2d3142"
                      textColor="#f6f1ee"
                      onClick={() => setShowAddMemberModal(true)}
                    />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 flex flex-wrap gap-4 text-sm font-sans text-gray-600">
                <span>Total: {members.length}</span>
                <span className="text-pareto-green">
                  Submitted: {submittedCount}
                </span>
                <span className="text-yellow-600">
                  Missing: {missingCount}
                </span>
              </div>

              {/* Member list */}
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-pareto-light rounded-2xl border-2 border-text-dark hover:bg-pareto-yellow transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-xl border-2 border-text-dark ${
                          member.status === "submitted"
                            ? "bg-pareto-green"
                            : "bg-gray-400"
                        }`}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-text-dark text-lg">
                            {member.name}
                          </p>
                          {member.isAdmin && (
                            <span className="bg-pareto-pink text-white text-xs px-2 py-1 rounded-full border border-text-dark font-sans">
                              Admin
                            </span>
                          )}
                        </div>
                        <p
                          className={`font-sans text-sm ${
                            member.status === "submitted"
                              ? "text-pareto-green"
                              : "text-yellow-600"
                          }`}
                        >
                          {member.status === "submitted"
                            ? "✓ Submitted"
                            : "⚠ Missing preferences"}
                        </p>
                      </div>
                    </div>
                    {mockUser.isAdmin && !member.isAdmin && (
                      <button
                        className="text-red-500 hover:text-red-700 p-2 text-xl"
                        onClick={() => openDeleteModal(member)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

       {/* Admin Settings View */}
{activeView === "settings" && mockUser.isAdmin && (
  <div className="space-y-6">
    <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
      <h3 className="font-display text-text-dark text-3xl mb-6">
        Admin Controls
      </h3>

      {/* changed layout here */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[260px]">
          <HanddrawnButton
            text="Send Reminders to Members"
            fillColor="#3b82f6"
            borderColor="#2d3142"
            textColor="#f6f1ee"
            onClick={() => setShowRemindersModal(true)}
          />
        </div>
        <div className="flex-1 min-w-[260px]">
          <HanddrawnButton
            text="Lock Group & Run Draw"
            fillColor="#f59e0b"
            borderColor="#2d3142"
            textColor="#f6f1ee"
            onClick={() => setShowLockDrawModal(true)}
          />
        </div>
        <div className="flex-1 min-w-[260px]">
          <HanddrawnButton
            text="Manual Pair Assignment"
            fillColor="#8b5cf6"
            borderColor="#2d3142"
            textColor="#f6f1ee"
            onClick={() => setShowManualPairModal(true)}
          />
        </div>
        <div className="flex-1 min-w-[260px]">
          <HanddrawnButton
            text="View Results Review"
            fillColor="#39b16c"
            borderColor="#2d3142"
            textColor="#f6f1ee"
            onClick={() => setShowResultsReviewModal(true)}
          />
        </div>
      </div>
    </div>


            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-6">
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Draw Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border-3 border-text-dark rounded-xl focus:border-pareto-pink focus:outline-none font-sans"
                    defaultValue="2025-12-15"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">
                    Budget Limits
                  </label>
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
        {activeView === "results" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-text-dark shadow-lg p-12 text-center">
              {drawComplete && myRecipient ? (
                <>
                  <span className="text-6xl mb-4 block">🏆</span>
                  <h3 className="font-display text-text-dark text-3xl mb-4">
                    Your Secret Santa Match!
                  </h3>
                  <div className="inline-flex items-center gap-4 px-6 py-4 bg-pareto-light rounded-3xl border-2 border-text-dark mb-4">
                    <div className="w-14 h-14 rounded-full bg-pareto-green text-white flex items-center justify-center font-display text-2xl border-2 border-text-dark">
                      {myRecipient.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-display text-text-dark text-2xl">
                        {myRecipient.name}
                      </p>
                      <p className="font-sans text-sm text-gray-600">
                        Keep it secret, keep it festive. 🎄
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-gray-600 max-w-xl mx-auto">
                    When this is wired up to the real backend, you&apos;ll also
                    see their wishlist and notes here to help you choose the
                    perfect gift.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-6xl mb-4 block opacity-50">🔒</span>
                  <h3 className="font-display text-text-dark text-3xl mb-4">
                    Results Not Available Yet
                  </h3>
                  <p className="font-sans text-gray-600">
                    The admin needs to lock the group and run the draw first.
                    Once that&apos;s done, your match will appear here.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ADD MEMBER MODAL */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={closeAddMemberModal}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Add New Member
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Enter member name"
                    className="w-full p-3 rounded-xl border-3 border-text-dark font-sans focus:outline-none focus:border-pareto-pink bg-pareto-light"
                  />
                  {newMemberName.trim() && (
                    <p className="mt-1 text-xs font-sans text-gray-500">
                      Avatar preview:{" "}
                      <span className="font-display">
                        {newMemberName.trim()[0].toUpperCase()}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="newMemberIsAdmin"
                    type="checkbox"
                    checked={newMemberIsAdmin}
                    onChange={(e) => setNewMemberIsAdmin(e.target.checked)}
                    className="w-4 h-4 border-2 border-text-dark rounded"
                  />
                  <label
                    htmlFor="newMemberIsAdmin"
                    className="font-sans text-sm text-gray-700"
                  >
                    Make this member an admin
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <HanddrawnButton
                  text="Cancel"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={closeAddMemberModal}
                />
                <HanddrawnButton
                  text="Add Member"
                  fillColor="#39b16c"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={handleAddMember}
                />
              </div>
            </div>
          </div>
        )}

        {/* DELETE MEMBER MODAL */}
        {showDeleteModal && memberToDelete && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={handleCancelDelete}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Remove Member
              </h3>
              <p className="font-sans text-gray-700 mb-4">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberToDelete.name}</span>{" "}
                from this group? They will no longer appear in the member list
                or draw results.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-lg border-2 border-text-dark ${
                    memberToDelete.status === "submitted"
                      ? "bg-pareto-green"
                      : "bg-gray-400"
                  }`}
                >
                  {memberToDelete.avatar}
                </div>
                <div>
                  <p className="font-display text-text-dark">
                    {memberToDelete.name}
                  </p>
                  <p className="font-sans text-xs text-gray-600">
                    {memberToDelete.isAdmin ? "Admin" : "Member"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <HanddrawnButton
                  text="Cancel"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={handleCancelDelete}
                />
                <HanddrawnButton
                  text="Delete"
                  fillColor="#ef4444"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={handleConfirmDelete}
                />
              </div>
            </div>
          </div>
        )}

        {/* SEND REMINDERS MODAL */}
        {showRemindersModal && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={() => setShowRemindersModal(false)}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Send Reminders to Members
              </h3>
              <p className="font-sans text-gray-700 mb-4">
                These members have not submitted their preferences yet. A reminder
                will nudge them to fill things out before the deadline.
              </p>

              <div className="max-h-40 overflow-y-auto mb-4 border border-dashed border-text-dark/40 rounded-2xl p-3 bg-pareto-light">
                {members.filter((m) => m.status === "missing").length === 0 ? (
                  <p className="font-sans text-sm text-gray-600">
                    Everyone has already submitted their preferences.
                  </p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 font-sans text-sm text-text-dark">
                    {members
                      .filter((m) => m.status === "missing")
                      .map((m) => (
                        <li key={m.id}>{m.name}</li>
                      ))}
                  </ul>
                )}
              </div>

              <p className="font-sans text-xs text-gray-500 mb-4">
                In a real app, this would send emails or push notifications. For
                now, this just represents that action in the UI.
              </p>

              <div className="flex justify-end gap-3">
                <HanddrawnButton
                  text="Cancel"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={() => setShowRemindersModal(false)}
                />
                <HanddrawnButton
                  text="Send Reminders"
                  fillColor="#3b82f6"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => {
                    console.log("Reminders sent to members with missing preferences.");
                    setShowRemindersModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* LOCK GROUP & RUN DRAW MODAL */}
        {showLockDrawModal && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={() => setShowLockDrawModal(false)}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Lock Group & Run Draw
              </h3>
              <p className="font-sans text-gray-700 mb-3">
                Locking the group will prevent members from changing their
                preferences, then it will generate gift pairings for everyone.
              </p>

              {missingCount > 0 && (
                <div className="mb-4 p-3 rounded-2xl border-2 border-yellow-500 bg-pareto-yellow/60">
                  <p className="font-sans text-sm text-text-dark">
                    Warning: there are still{" "}
                    <span className="font-semibold">{missingCount}</span>{" "}
                    member(s) with missing preferences. You can still run the draw,
                    but some matches may have less information.
                  </p>
                </div>
              )}

              <ul className="list-disc list-inside mb-4 space-y-1 font-sans text-sm text-gray-700">
                <li>The group will be locked for edits.</li>
                <li>Each member will receive exactly one person to gift.</li>
                <li>You can review results in the Results view afterwards.</li>
              </ul>

              <div className="flex justify-end gap-3">
                <HanddrawnButton
                  text="Cancel"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={() => setShowLockDrawModal(false)}
                />
                <HanddrawnButton
                  text="Confirm & Run Draw"
                  fillColor="#f59e0b"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => {
                    setDrawComplete(true);
                    setShowLockDrawModal(false);
                    setActiveView("results");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* MANUAL PAIR ASSIGNMENT MODAL */}
        {showManualPairModal && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-xl rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={() => setShowManualPairModal(false)}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                Manual Pair Assignment
              </h3>
              <p className="font-sans text-gray-700 mb-3">
                Use manual pairing when you want to override the automatic draw,
                keep certain people apart, or handle special cases.
              </p>

              <div className="max-h-56 overflow-y-auto mb-4 border border-dashed border-text-dark/40 rounded-2xl p-3 bg-pareto-light">
                <p className="font-sans text-sm text-gray-700 mb-2">
                  Example of current automatic pairings:
                </p>
                <ul className="space-y-1 font-sans text-sm text-text-dark">
                  {mockAssignments.map((pair) => {
                    const giver = members.find((m) => m.id === pair.giverId);
                    const receiver = members.find((m) => m.id === pair.receiverId);
                    if (!giver || !receiver) return null;
                    return (
                      <li key={`${pair.giverId}-${pair.receiverId}`}>
                        <span className="font-semibold">{giver.name}</span>{" "}
                        → {receiver.name}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="font-sans text-xs text-gray-500 mb-4">
                In a future version, this panel could include drag-and-drop
                tools or dropdowns to fully customize pairs and then save them.
              </p>

              <div className="flex justify-end gap-3">
                <HanddrawnButton
                  text="Close"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={() => setShowManualPairModal(false)}
                />
                <HanddrawnButton
                  text="Use Automatic Pairs"
                  fillColor="#8b5cf6"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => {
                    setShowManualPairModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW RESULTS REVIEW MODAL */}
        {showResultsReviewModal && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-3xl border-4 border-text-dark shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform"
                onClick={() => setShowResultsReviewModal(false)}
              >
                ✕
              </button>
              <h3 className="font-display text-text-dark text-2xl mb-4">
                View Results Review
              </h3>
              <p className="font-sans text-gray-700 mb-3">
                The Results view shows each member who they are gifting to. As
                an admin, you can quickly check that the draw completed as
                expected.
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1 font-sans text-sm text-gray-700">
                <li>Check that nobody was assigned to themselves.</li>
                <li>Scan for any conflicts you wanted to avoid.</li>
                <li>Confirm the group is ready for gifting day.</li>
              </ul>

              <div className="flex justify-end gap-3">
                <HanddrawnButton
                  text="Close"
                  fillColor="#f6f1ee"
                  borderColor="#2d3142"
                  textColor="#2d3142"
                  onClick={() => setShowResultsReviewModal(false)}
                />
                <HanddrawnButton
                  text="Open Results"
                  fillColor="#39b16c"
                  borderColor="#2d3142"
                  textColor="#f6f1ee"
                  onClick={() => {
                    setShowResultsReviewModal(false);
                    setActiveView("results");
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
