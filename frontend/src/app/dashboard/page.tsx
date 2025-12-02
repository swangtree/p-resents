'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import RainbowText from '../../components/RainbowText';
import HanddrawnButton from '../../components/HanddrawnButton';
import Link from 'next/link';

// Define the Group type based on your Supabase schema
export interface Group {
  id: string; // UUID
  name: string;
  group_code: string;
  created_at: string;
  created_by: string; // UUID
}

// NEW: Define the specific type for the profile query result
type ProfileGroup = {
  group_id: string | null;
}


// --- Dashboard Sub-Components (Views) ---

// Component shown if the user is in a group
const DashboardGroupView: React.FC<{ group: Group }> = ({ group }) => (
  <div className="text-center">
    <h2 className="chalk-text text-pareto-light text-2xl mb-4">
      You are in: <RainbowText text={group.name} className="text-2xl" />
    </h2>
    
    <p className="chalk-text text-pareto-light/80 text-xl mb-8">
      Group Code: <span className="text-pareto-pink font-bold">{group.group_code}</span>
    </p>

    <div className="flex flex-col space-y-4 items-center">
      {/* Example: Link to Preferences Page */}
      <Link href="/preferences" passHref legacyBehavior>
        <HanddrawnButton
          text="Manage My Preferences"
          fillColor="#6caade"
          borderColor="#f6f1ee"
          textColor="#f6f1ee"
          type="button"
        />
      </Link>
      
      {/* Example: Link to Match Results Page */}
      <Link href="/results" passHref legacyBehavior>
        <HanddrawnButton
          text="View Match Results"
          fillColor="#39b16c"
          borderColor="#15131c"
          textColor="#15131c"
          type="button"
        />
      </Link>
    </div>
  </div>
);

// Component shown if the user is NOT in a group
const NoGroupView: React.FC = () => (
  <div className="text-center">
    <h2 className="chalk-text text-pareto-light text-2xl mb-6">
      You are not currently in a group.
    </h2>
    
    <div className="flex flex-col space-y-4 items-center">
      <Link href="/create-group" passHref legacyBehavior>
        <HanddrawnButton
          text="Create a New Group"
          fillColor="#ff7eba"
          borderColor="#f6f1ee"
          textColor="#f6f1ee"
          type="button"
        />
      </Link>
      
      <Link href="/join-group" passHref legacyBehavior>
        <HanddrawnButton
          text="Join an Existing Group"
          fillColor="#6caade"
          borderColor="#f6f1ee"
          textColor="#f6f1ee"
          type="button"
        />
      </Link>
    </div>
  </div>
);


// --- Main Dashboard Page ---

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<Group | null>(null);

  // Function that performs the group query logic (the "QueryGroup" step)
  const fetchGroupData = useCallback(async (userId: string) => {
    
    // 1. Fetch the user's profile to get the group_id
    // FIX APPLIED: Explicitly using single<ProfileGroup>() to resolve the type error
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('group_id')
      .eq('id', userId)
      .single<ProfileGroup>(); 

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = No row found
      // Log other non-not-found errors
      console.error("Error fetching profile:", profileError);
      setError("Failed to load user profile.");
      setLoading(false);
      return;
    }

    // profileData will be null if no row is found (PGRST116 error handled above)
    if (!profileData || !profileData.group_id) {
      // User is authenticated but not in a group
      setUserGroup(null);
      setLoading(false);
      return;
    }

    // 2. Fetch the group details using the group_id
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', profileData.group_id)
      .single();

    if (groupError) {
      console.error("Error fetching group:", groupError);
      setError("Failed to load group details.");
      setUserGroup(null);
    } else if (groupData) {
      setUserGroup(groupData as Group); // Cast to Group type for safety
    }

    setLoading(false);

  }, [supabase]);

  // Main Effect: Check auth and initiate data fetch
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // If not authenticated, redirect to login
        router.push('/login');
        return;
      }

      await fetchGroupData(user.id);
    };

    checkAuthAndFetchData();
  }, [router, supabase, fetchGroupData]);


  // --- Render States ---

  if (loading) {
    return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center">
        <main className="w-full text-center">
          <p className="chalk-text text-pareto-light text-xl">
            Loading Dashboard...
          </p>
        </main>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex bg-pareto-dark min-h-screen items-center justify-center p-8">
        <main className="w-full max-w-lg text-center">
          <h1 className="font-display text-pareto-light text-4xl mb-8">
            <RainbowText text="Dashboard Error" className="text-4xl" />
          </h1>
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6 chalk-text">
            {error}
          </div>
          <Link href="/" passHref legacyBehavior>
            <HanddrawnButton
                text="Go Home"
                fillColor="#ff7eba"
                borderColor="#f6f1ee"
                textColor="#f6f1ee"
                type="button"
            />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-pareto-dark min-h-screen items-center justify-center p-8">
      <main className="w-full max-w-xl">
        <h1 className="font-display text-pareto-light text-4xl text-center mb-10">
            <RainbowText text="Your Group Dashboard" className="text-4xl" />
        </h1>
        
        <div className="bg-pareto-light/10 p-8 rounded-xl border border-pareto-light/20 min-h-[300px] flex items-center justify-center">
            {userGroup ? (
                <DashboardGroupView group={userGroup} />
            ) : (
                <NoGroupView />
            )}
        </div>
      </main>
    </div>
  );
}