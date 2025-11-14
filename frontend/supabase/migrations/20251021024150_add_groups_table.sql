-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  group_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Add group_id to profile table
ALTER TABLE profile 
  ADD COLUMN group_id UUID REFERENCES groups(id);

-- Add indexes
CREATE INDEX idx_groups_code ON groups(group_code);
CREATE INDEX idx_profile_group ON profile(group_id);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own group"
  ON groups FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profile WHERE group_id = groups.id
  ));

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);