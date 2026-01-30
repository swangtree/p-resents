import { vi } from 'vitest';

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export const mockProfile = {
  id: 'user-123',
  group_id: 'group-456',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockGroup = {
  id: 'group-456',
  name: 'Test Gift Exchange',
  group_code: 'ABC123',
  created_by: 'user-123',
  created_at: new Date().toISOString(),
};

export const mockGroupMembers = [
  { id: 'user-123', user_data: { email: 'User user-123...' } },
  { id: 'user-456', user_data: { email: 'User user-456...' } },
  { id: 'user-789', user_data: { email: 'User user-789...' } },
];

export const mockPreferences = {
  user_id: 'user-123',
  group_id: 'group-456',
  preference_practicality_giving: 4,
  preference_novelty_giving: 3,
  preference_thoughtfulness_giving: 5,
  preference_practicality_receiving: 3,
  preference_novelty_receiving: 4,
  preference_thoughtfulness_receiving: 5,
  we_hate_being_stolen_from: 2,
  we_enjoy_stealing: 3,
  hate_missing_out: 4,
  enjoy_missing_out: 2,
  interests: ['hiking', 'cooking'],
  exclusions: [],
};

export const mockMatchResults = {
  id: 'result-123',
  group_id: 'group-456',
  ruleset: 'max_utility',
  pairings: [
    { giver: 'user-123', receiver: 'user-456', utility: 0.85 },
    { giver: 'user-456', receiver: 'user-789', utility: 0.72 },
    { giver: 'user-789', receiver: 'user-123', utility: 0.78 },
  ],
  play_order: null,
  statistics: null,
  seed: 42,
  created_at: new Date().toISOString(),
  created_by: 'user-123',
};

export const mockWhiteElephantResults = {
  id: 'result-456',
  group_id: 'group-456',
  ruleset: 'white_elephant',
  pairings: null,
  play_order: ['user-123', 'user-456', 'user-789'],
  statistics: null,
  seed: 42,
  created_at: new Date().toISOString(),
  created_by: 'user-123',
};

// Create mock Supabase client
export const createMockSupabaseClient = (overrides: Record<string, unknown> = {}) => {
  const defaultClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table: string) => {
      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Default responses based on table
      if (table === 'profile') {
        queryBuilder.single = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
        queryBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      } else if (table === 'groups') {
        queryBuilder.single = vi.fn().mockResolvedValue({ data: mockGroup, error: null });
      } else if (table === 'preferences') {
        queryBuilder.select = vi.fn().mockReturnValue({
          ...queryBuilder,
          eq: vi.fn().mockResolvedValue({ data: [mockPreferences], error: null }),
        });
      } else if (table === 'match_results') {
        queryBuilder.select = vi.fn().mockReturnValue({
          ...queryBuilder,
          eq: vi.fn().mockReturnValue({
            ...queryBuilder,
            order: vi.fn().mockReturnValue({
              ...queryBuilder,
              limit: vi.fn().mockResolvedValue({ data: [mockMatchResults], error: null }),
            }),
          }),
        });
      }

      return queryBuilder;
    }),
  };

  return { ...defaultClient, ...overrides };
};

// Mock the createClient function
export const mockCreateClient = vi.fn(() => createMockSupabaseClient());
