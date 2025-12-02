import { createClient } from '@/lib/supabase';

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

  static async savePreferences(preferences: any) {
    const supabase = createClient();
    const { error } = await supabase
      .from('preferences')
      .upsert(preferences);
    
    if (error) throw error;
  }

  static async saveMatchResults(result: any) {
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
    const { data, error } = await supabase
      .from('profile')
      .select('id, user_data(email)')
      .eq('group_id', groupId);
    
    if (error) throw error;
    return data || [];
  }
}