import { createClient } from '@/lib/supabase';
import { SavePreferencesInput, SaveMatchResultsInput } from '@/types/database.types';

export class SupabaseService {
  static async getGroupPreferences(groupId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('group_id', groupId);
    
    if (error) throw error;
    return data || [];
  }

  static async savePreferences(preferences: SavePreferencesInput) {
    const supabase = createClient();
    
    // Use upsert with onConflict to handle insert or update
    const { error } = await supabase
      .from('preferences')
      .upsert(
        {
          user_id: preferences.user_id,
          group_id: preferences.group_id,
          preference_practicality_giving: preferences.preference_practicality_giving,
          preference_novelty_giving: preferences.preference_novelty_giving,
          preference_thoughtfulness_giving: preferences.preference_thoughtfulness_giving,
          preference_practicality_receiving: preferences.preference_practicality_receiving,
          preference_novelty_receiving: preferences.preference_novelty_receiving,
          preference_thoughtfulness_receiving: preferences.preference_thoughtfulness_receiving,
          we_hate_being_stolen_from: preferences.we_hate_being_stolen_from,
          we_enjoy_stealing: preferences.we_enjoy_stealing,
          hate_missing_out: preferences.hate_missing_out,
          enjoy_missing_out: preferences.enjoy_missing_out,
          interests: preferences.interests,
          exclusions: preferences.exclusions,
        },
        {
          onConflict: 'user_id,group_id',
        }
      );
    
    if (error) {
      console.error('Supabase error saving preferences:', error);
      throw error;
    }
  }

  static async saveMatchResults(result: SaveMatchResultsInput) {
    const supabase = createClient();
    const { error } = await supabase
      .from('match_results')
      .insert(result);
    
    if (error) throw error;
  }

  static async getMatchResults(groupId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('match_results')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  }

  static async getGroupMembers(groupId: string) {
    const supabase = createClient();
    
    // Simple approach: just get profile IDs from the group
    // We can't read other users' emails due to RLS, so we'll show IDs
    const { data: profiles, error } = await supabase
      .from('profile')
      .select('id')
      .eq('group_id', groupId);
    
    if (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
    
    // Return in expected format with ID as email placeholder
    return (profiles || []).map(profile => ({
      id: profile.id,
      user_data: { 
        email: `User ${profile.id.slice(0, 8)}...` // Show first 8 chars of ID
      }
    }));
  }

  static async getUserNames(userIds: string[]): Promise<Record<string, string>> {
    console.log('🔍 Getting names for user IDs:', userIds);
    const supabase = createClient();
    
    // Debug: Check each user ID individually first
    for (const userId of userIds) {
      const { data: singleProfile } = await supabase
        .from('profile')
        .select('id, name')
        .eq('id', userId)
        .maybeSingle();
      console.log(`🔍 Individual check for ${userId}:`, singleProfile);
    }
    
    const { data: profiles, error } = await supabase
      .from('profile')
      .select('id, name')
      .in('id', userIds);
    
    console.log('📊 Batch query - Profiles found:', profiles?.length);
    console.log('📊 Batch query - Full profiles:', profiles);
    console.log('❌ Batch query - Error:', error);
    
    if (error) {
      console.error('Error fetching user names:', error);
      return {};
    }
    
    const nameMap: Record<string, string> = {};
    profiles?.forEach(profile => {
      nameMap[profile.id] = profile.name || `User ${profile.id.slice(0, 8)}...`;
    });
    
    console.log('🎯 Final name map:', nameMap);
    return nameMap;
  }
}