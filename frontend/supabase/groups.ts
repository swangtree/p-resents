import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/*
Helper functions for creating, joining, getting groups for a user.
*/
export async function joinGroup(groupCode: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Find group by code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('group_code', groupCode)
    .single()
  
  if (groupError) throw new Error('Invalid group code')
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  // Update user profile
  const { error: updateError } = await supabase
    .from('profile')
    .update({ group_id: group.id })
    .eq('id', user.id)
  
  if (updateError) throw updateError
  
  return group
}

export async function createGroup(name: string, groupCode: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      group_code: groupCode,
      created_by: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  
  return data
}

export async function getUserGroup() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  // Get user's profile with group info
  const { data, error } = await supabase
    .from('profile')
    .select('group_id, groups(*)')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  
  return data
}