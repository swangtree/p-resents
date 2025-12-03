import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// --- Supabase Client Initialization ---
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- Type Alias for Cleaner Function Return Types ---
type GroupRow = Database['public']['Tables']['groups']['Row'];


/*
Helper functions for creating, joining, and getting groups for an authenticated user.
*/

/**
 * Allows an authenticated user to join a group using a group code.
 * This overwrites the user's current group_id in the 'profile' table (One-to-Many).
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
  
  // 3. Update user's profile with the new group_id
  const { error: updateError } = await supabase
    .from('profile')
    .update({ group_id: group.id }) // <--- Corrected to use profile.group_id
    .eq('id', user.id)
  
  if (updateError) {
    throw new Error('Failed to join group: ' + updateError.message)
  }
  
  return group
}

/**
 * Creates a new group and automatically sets the authenticated user as the admin (created_by) 
 * and immediately assigns them to the new group.
 * @param name The name of the new group.
 * @param groupCode The unique code for the new group.
 * @returns The newly created group row.
 */
export async function createGroup(name: string, groupCode: string): Promise<GroupRow> {
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }
  
  // 2. Create the Group, setting the creator as created_by
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      group_code: groupCode,
      created_by: user.id // Set the creator
    })
    .select()
    .single()
  
  if (groupError || !groupData) {
    throw new Error('Failed to create group: ' + (groupError?.message || 'Unknown error'))
  }
  
  // 3. Assign the creator to the newly created group
  const { error: profileUpdateError } = await supabase
    .from('profile')
    .update({ group_id: groupData.id }) // <--- Assign user to the group
    .eq('id', user.id)
  
  if (profileUpdateError) {
      console.error("Warning: Group created successfully but failed to assign creator to group:", profileUpdateError);
  }
  
  return groupData
}

/**
 * Fetches the group the authenticated user is currently a participant in.
 * * @returns The Group object, or null if the user is not in a group.
 */
export async function getUserGroup(): Promise<GroupRow | null> {
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }
  
  // 2. Get user's profile with group info
  // This performs a LEFT JOIN on the groups table via the group_id foreign key.
  const { data, error } = await supabase
    .from('profile')
    .select('group_id, groups(*)')
    .eq('id', user.id)
    .single()
  
  if (error) {
    throw new Error('Failed to fetch user group: ' + error.message)
  }
  
  // The groups data is nested inside 'groups' due to the join.
  // Returns the group object (or null if the user has no group_id)
  return data?.groups || null
}