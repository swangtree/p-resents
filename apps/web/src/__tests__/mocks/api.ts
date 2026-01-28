import { vi } from 'vitest';
import type { RecalculateResponse, FinalizeResponse, SendNotificationsResponse } from '@/types/api.types';

export const mockStatistics: RecalculateResponse = {
  statistics: [
    {
      ruleset_name: 'random',
      avg_utility: 0.65,
      min_utility: 0.45,
      max_utility: 0.85,
      std_utility: 0.12,
      fairness_score: 0.15,
    },
    {
      ruleset_name: 'max_utility',
      avg_utility: 0.82,
      min_utility: 0.68,
      max_utility: 0.95,
      std_utility: 0.08,
      fairness_score: 0.10,
    },
    {
      ruleset_name: 'max_fairness',
      avg_utility: 0.75,
      min_utility: 0.72,
      max_utility: 0.78,
      std_utility: 0.02,
      fairness_score: 0.02,
    },
    {
      ruleset_name: 'white_elephant',
      avg_utility: 0.70,
      min_utility: 0.55,
      max_utility: 0.88,
      std_utility: 0.10,
      fairness_score: 0.08,
      expected_happiness: 0.72,
    },
  ],
};

export const mockFinalizeResponse: FinalizeResponse = {
  ruleset: 'max_utility',
  pairings: [
    { giver: 'user-123', receiver: 'user-456', utility: 0.85 },
    { giver: 'user-456', receiver: 'user-789', utility: 0.72 },
    { giver: 'user-789', receiver: 'user-123', utility: 0.78 },
  ],
};

export const mockWhiteElephantFinalizeResponse: FinalizeResponse = {
  ruleset: 'white_elephant',
  play_order: ['user-123', 'user-456', 'user-789'],
};

export const mockNotificationsResponse: SendNotificationsResponse = {
  group_id: 'group-456',
  total_sent: 3,
  total_failed: 0,
  success: ['user-123', 'user-456', 'user-789'],
  failed: [],
  message: 'Successfully sent 3 notifications',
};

// Mock ApiService
export const mockApiService = {
  recalculate: vi.fn().mockResolvedValue(mockStatistics),
  finalize: vi.fn().mockResolvedValue(mockFinalizeResponse),
  sendNotifications: vi.fn().mockResolvedValue(mockNotificationsResponse),
};
