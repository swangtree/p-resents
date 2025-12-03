-- =====================================================
-- PARETO PRESENTS - DEMO SEED DATA
-- =====================================================
--
-- STEP 1: Create 8 test users in Supabase Dashboard
--         Authentication → Users → Add User
--
-- STEP 2: Copy their UUIDs and replace below
-- =====================================================

DO $$
DECLARE
  samuel_id UUID := 'f2f22228-0361-4a2a-b3ee-fa3e98bc18bf';    -- Replace
  liam_id UUID := 'a6affd86-dba6-4036-a33a-5cb914243ed8';      -- Replace
  charlotte_id UUID := '47944696-96ca-498a-b77d-96d58fbaa737'; -- Replace
  joanna_id UUID := 'ed761483-25e6-4b3c-99d0-cde7a2ed88fa';    -- Replace
  sam_id UUID := '74aba95f-cfd3-4401-ba86-d90af469357c';       -- Replace
  stefanie_id UUID := '436b5427-6c4b-4188-ba5f-97d331eede01';  -- Replace
  justin_id UUID := 'bc84b7d9-a056-4c08-9418-ea21620c736f';    -- Replace
  cole_id UUID := 'ea82cd1c-d5b9-481d-ad87-e80f4b33d3e5';      -- Replace
  demo_group_id UUID;
BEGIN

-- Create demo group
INSERT INTO groups (id, name, group_code, created_by)
VALUES (gen_random_uuid(), 'Holiday Gift Exchange 2024', 'DEMO2024', samuel_id)
RETURNING id INTO demo_group_id;

-- Create profiles and link to group
INSERT INTO profile (id, group_id) VALUES
  (samuel_id, demo_group_id),
  (liam_id, demo_group_id),
  (charlotte_id, demo_group_id),
  (joanna_id, demo_group_id),
  (sam_id, demo_group_id),
  (stefanie_id, demo_group_id),
  (justin_id, demo_group_id),
  (cole_id, demo_group_id)
ON CONFLICT (id) DO UPDATE SET group_id = EXCLUDED.group_id;

-- Create user_data entries
INSERT INTO user_data (id, email) VALUES
  (samuel_id, 'samuel@demo.com'),
  (liam_id, 'liam@demo.com'),
  (charlotte_id, 'charlotte@demo.com'),
  (joanna_id, 'joanna@demo.com'),
  (sam_id, 'sam@demo.com'),
  (stefanie_id, 'stefanie@demo.com'),
  (justin_id, 'justin@demo.com'),
  (cole_id, 'cole@demo.com')
ON CONFLICT (id) DO NOTHING;

-- Create preferences for each user
INSERT INTO preferences (user_id, group_id, giving_practicality, giving_novelty, giving_sentimentality, receiving_practicality, receiving_novelty, receiving_sentimentality, interests)
VALUES
  (samuel_id, demo_group_id, 4, 3, 5, 3, 4, 5, ARRAY['books', 'cooking', 'hiking']),
  (liam_id, demo_group_id, 5, 2, 3, 5, 3, 2, ARRAY['tech', 'gaming', 'coffee']),
  (charlotte_id, demo_group_id, 3, 5, 4, 2, 5, 4, ARRAY['art', 'music', 'travel']),
  (joanna_id, demo_group_id, 4, 4, 3, 4, 4, 3, ARRAY['sports', 'movies', 'food']),
  (sam_id, demo_group_id, 3, 4, 5, 4, 3, 5, ARRAY['photography', 'nature', 'yoga']),
  (stefanie_id, demo_group_id, 5, 3, 4, 3, 5, 3, ARRAY['fashion', 'design', 'plants']),
  (justin_id, demo_group_id, 4, 5, 2, 5, 4, 2, ARRAY['cars', 'fitness', 'gadgets']),
  (cole_id, demo_group_id, 2, 4, 5, 3, 4, 4, ARRAY['music', 'vinyl', 'concerts']);

-- Create sample match results
INSERT INTO match_results (group_id, ruleset, pairings, statistics, seed, created_by)
VALUES (
  demo_group_id,
  'max_utility',
  jsonb_build_array(
    jsonb_build_object('giver_id', samuel_id, 'receiver_id', charlotte_id, 'utility', 0.89),
    jsonb_build_object('giver_id', liam_id, 'receiver_id', justin_id, 'utility', 0.85),
    jsonb_build_object('giver_id', charlotte_id, 'receiver_id', cole_id, 'utility', 0.92),
    jsonb_build_object('giver_id', joanna_id, 'receiver_id', sam_id, 'utility', 0.78),
    jsonb_build_object('giver_id', sam_id, 'receiver_id', stefanie_id, 'utility', 0.81),
    jsonb_build_object('giver_id', stefanie_id, 'receiver_id', joanna_id, 'utility', 0.87),
    jsonb_build_object('giver_id', justin_id, 'receiver_id', liam_id, 'utility', 0.83),
    jsonb_build_object('giver_id', cole_id, 'receiver_id', samuel_id, 'utility', 0.79)
  ),
  '[
    {"ruleset": "random", "avg_utility": 0.62, "min_utility": 0.38, "max_utility": 0.84},
    {"ruleset": "max_utility", "avg_utility": 0.84, "min_utility": 0.78, "max_utility": 0.92},
    {"ruleset": "max_fairness", "avg_utility": 0.75, "min_utility": 0.73, "max_utility": 0.77}
  ]'::jsonb,
  42,
  samuel_id
);

RAISE NOTICE 'Demo data created! Group code: DEMO2024';

END $$;
