-- =====================================================
-- PARETO PRESENTS - COMPLETE DEMO SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: SCHEMA SETUP
-- =====================================================

-- Profile table
create table "public"."profile" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text)
);

alter table "public"."profile" enable row level security;

-- User data table
create table "public"."user_data" (
    "email" text not null,
    "field_1" text,
    "field_2" text,
    "field_3" text,
    "field_4" text,
    "field_5" text,
    "field_6" text,
    "field_7" text,
    "field_8" text,
    "field_9" text,
    "field_10" text,
    "id" uuid not null
);

alter table "public"."user_data" enable row level security;

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);
CREATE UNIQUE INDEX user_data_id_key ON public.user_data USING btree (id);
CREATE UNIQUE INDEX user_data_pkey ON public.user_data USING btree (id);
CREATE UNIQUE INDEX "user_data_references auth.users_key" ON public.user_data USING btree (email);

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";
alter table "public"."user_data" add constraint "user_data_pkey" PRIMARY KEY using index "user_data_pkey";
alter table "public"."user_data" add constraint "user_data_id_key" UNIQUE using index "user_data_id_key";
alter table "public"."user_data" add constraint "user_data_references auth.users_key" UNIQUE using index "user_data_references auth.users_key";

create policy "Enable read access for authenticated user"
on "public"."profile"
as permissive
for select
to authenticated
using (true);

-- Groups table
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

-- RLS Policies for groups
CREATE POLICY "Users can view their own group"
  ON groups FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profile WHERE group_id = groups.id
  ));

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Allow anyone to view groups (for joining)
CREATE POLICY "Anyone can view groups by code"
  ON groups FOR SELECT
  USING (true);

-- Preferences table
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  group_id UUID REFERENCES groups(id) NOT NULL,

  -- Giving preferences (1-5 scale)
  giving_practicality INT CHECK (giving_practicality BETWEEN 1 AND 5),
  giving_novelty INT CHECK (giving_novelty BETWEEN 1 AND 5),
  giving_sentimentality INT CHECK (giving_sentimentality BETWEEN 1 AND 5),

  -- Receiving preferences (1-5 scale)
  receiving_practicality INT CHECK (receiving_practicality BETWEEN 1 AND 5),
  receiving_novelty INT CHECK (receiving_novelty BETWEEN 1 AND 5),
  receiving_sentimentality INT CHECK (receiving_sentimentality BETWEEN 1 AND 5),

  -- Additional data
  interests TEXT[],
  exclusions UUID[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, group_id)
);

-- Match results table
CREATE TABLE match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) NOT NULL,
  ruleset TEXT NOT NULL,
  pairings JSONB,
  play_order TEXT[],
  statistics JSONB,
  seed INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_preferences_user ON preferences(user_id);
CREATE INDEX idx_preferences_group ON preferences(group_id);
CREATE INDEX idx_match_results_group ON match_results(group_id);

-- Enable RLS
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preferences
CREATE POLICY "Users can view preferences in their group"
  ON preferences FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM profile WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their own preferences"
  ON preferences FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for match_results
CREATE POLICY "Users can view results in their group"
  ON match_results FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM profile WHERE id = auth.uid()
  ));

CREATE POLICY "Group creators can manage results"
  ON match_results FOR ALL
  USING (created_by = auth.uid());

-- =====================================================
-- PART 2: ADDITIONAL POLICIES FOR DEMO
-- =====================================================

-- Allow authenticated users to insert into profile
CREATE POLICY "Users can insert own profile"
  ON profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profile FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to read user_data
CREATE POLICY "Authenticated users can read user_data"
  ON user_data FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own user_data
CREATE POLICY "Users can insert own user_data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own user_data
CREATE POLICY "Users can update own user_data"
  ON user_data FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Now enable Email auth in Authentication > Providers
-- Then create test users and they can start using the app
