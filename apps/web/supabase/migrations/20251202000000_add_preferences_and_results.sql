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

-- RLS Policies
CREATE POLICY "Users can view preferences in their group"
  ON preferences FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM profile WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their own preferences"
  ON preferences FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view results in their group"
  ON match_results FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM profile WHERE id = auth.uid()
  ));

CREATE POLICY "Group creators can manage results"
  ON match_results FOR ALL
  USING (created_by = auth.uid());