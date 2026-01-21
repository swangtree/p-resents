import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// NOTE: We assume createClient is imported from '@/lib/supabase'
import { createClient as createSupabaseClient } from '@/lib/supabase' 

// Use the client factory from your utility file
const supabase = createSupabaseClient();

// --- Type Alias for Cleaner Function Return Types ---
// Assuming this is the standard row type for your 'groups' table after type generation
type GroupRow = Database['public']['Tables']['groups']['Row'];


/*
Helper functions for creating, joining, and getting groups for a user based on the 
One-to-Many relationship using profile.group_id.
*/

/**
 * Allows an authenticated user to join a group using a group code.
 * This overwrites the user's current group_id in the 'profile' table.
 * @param groupCode The unique code for the group to join.
 * @returns The group ID of the joined group.
 */
export async function joinGroup(groupCode: string): Promise<{ id: string }> {
  // 1. Find group by code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('group_code', groupCode)
    .single()
  
  if (groupError || !group) {
    throw new Error('Invalid group code or group does not exist.')
  }
  
  // 2. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }
  
  // 3. Update user's profile with the new group_id (One-to-Many relationship)
  const { error: updateError } = await supabase
    .from('profile')
    .update({ group_id: group.id })
    .eq('id', user.id)
  
  if (updateError) {
    throw new Error('Failed to join group: ' + updateError.message)
  }
  
  // Explicit cast for TS compatibility
  return group as { id: string }
}

/**
 * Creates a new group and automatically sets the authenticated user as the creator (created_by) 
 * and immediately assigns them to the new group.
 * @param name The name of the new group.
 * @param groupCode The unique code for the new group.
 * @returns The newly created group row.
 */
export async function createGroup(name: string, groupCode: string): Promise<GroupRow> {
  
  // 1. Get authenticated user (RESTORED)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }

  // 1b. UNIQUE CODE CHECK (Pre-insert check for robustness)
  const { count, error: countError } = await supabase
    .from('groups')
    .select('id', { count: 'exact' })
    .eq('group_code', groupCode);

  if (countError) {
      throw new Error('Failed to check group code uniqueness: ' + countError.message);
  }
  
  if (count && count > 0) {
      throw new Error('Group code already in use. Please generate a new code.');
  }
  
  // 2. Create the Group, setting the creator as created_by
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      group_code: groupCode,
      created_by: user.id 
    })
    .select()
    .single()
  
  if (groupError || !groupData) {
    console.error("Supabase insert error details:", groupError);
    
    // CHECK FOR UNIQUE CONSTRAINT VIOLATION (PostgreSQL error code 23505)
    if (groupError?.code === '23505') {
         throw new Error('Group creation failed: The group code is already in use (Database Unique Constraint Violation).');
    }
    
    // Otherwise, throw a generic error
    throw new Error('Failed to create group: ' + (groupError?.message || 'Unknown RLS or constraint error'));
  }
  
  // 3. Assign the creator to the newly created group (RESTORED)
  // This relies on the "Users can update their own profile" RLS policy being set.
  const { error: profileUpdateError } = await supabase
    .from('profile')
    .update({ group_id: groupData.id }) // Assign user to the group
    .eq('id', user.id)
  
  if (profileUpdateError) {
      console.error("Warning: Group created successfully but failed to assign creator to group:", profileUpdateError);
  }
  
  // Explicit cast for TS compatibility
  return groupData as GroupRow
}

/**
 * Gets the current group the authenticated user belongs to.
 * @returns The Group object, or null if the user is not in a group.
 */
export async function getUserGroup(): Promise<GroupRow | null> {
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }
  
  // 2. Get user's profile and join the associated group data
  const { data, error } = await supabase
    .from('profile')
    // We are selecting the group_id from profile and joining the *full* group row
    .select('group_id, groups(*)') 
    .eq('id', user.id)
    .single()
  
  if (error) {
    // Suppress the "No row found" error (PGRST116)
    if (error.code !== 'PGRST116') {
        throw new Error('Failed to fetch user group: ' + error.message)
    }
  }
  
  // The group data is nested under the 'groups' property of the result.
  // Explicit cast to resolve previous return type errors
  return (data?.groups || null) as GroupRow | null
}