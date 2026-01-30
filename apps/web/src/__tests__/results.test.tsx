import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test-utils';
import userEvent from '@testing-library/user-event';
import ResultsPage from '@/app/results/page';
import {
  mockUser,
  mockProfile,
  mockGroup,
  mockMatchResults,
  mockWhiteElephantResults,
  mockPreferences,
} from './mocks/supabase';
import { mockStatistics, mockFinalizeResponse } from './mocks/api';

// Mock the supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock services
vi.mock('@/services/supabase.service', () => ({
  SupabaseService: {
    getGroupPreferences: vi.fn(),
    getMatchResults: vi.fn(),
    saveMatchResults: vi.fn(),
    getGroupMembersWithEmails: vi.fn(),
  },
}));

vi.mock('@/services/api.service', () => ({
  ApiService: {
    recalculate: vi.fn(),
    finalize: vi.fn(),
    sendNotifications: vi.fn(),
  },
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/results',
}));

import { SupabaseService } from '@/services/supabase.service';
import { ApiService } from '@/services/api.service';

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication state handling', () => {
    it('redirects to login when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(<ResultsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('shows loading spinner while checking authentication', () => {
      mockSupabaseClient.auth.getUser.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ResultsPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading results...')).toBeInTheDocument();
    });
  });

  describe('No group state', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockProfile, group_id: null },
          error: null,
        }),
      });
    });

    it('shows message when user has no group', async () => {
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText("You're not part of a group yet.")).toBeInTheDocument();
      });
    });
  });

  describe('Regular user view - no results yet', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'user-456' } }, // Different user (not admin)
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockProfile, id: 'user-456' },
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockGroup, // created_by is user-123, not user-456
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(null);
    });

    it('shows waiting message for non-admin user without results', async () => {
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('No results yet!')).toBeInTheDocument();
        expect(screen.getByText('Your group admin needs to finalize the matching. Check back soon!')).toBeInTheDocument();
      });
    });
  });

  describe('Regular user view - with Secret Santa results', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'user-123' } },
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockGroup, created_by: 'different-user' }, // Not the admin
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(mockMatchResults);
    });

    it('shows user match for Secret Santa', async () => {
      render(<ResultsPage />);

      // Wait for page to load - use a non-RainbowText element as anchor
      await waitFor(() => {
        expect(screen.getByText('Secret Santa Match')).toBeInTheDocument();
      });

      // User user-123 is giving to user-456
      expect(screen.getByText("You're giving a gift to:")).toBeInTheDocument();
      expect(screen.getByText('user-456')).toBeInTheDocument();
    });

    it('displays the algorithm used', async () => {
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('max_utility')).toBeInTheDocument();
      });
    });

    it('shows utility score for the match', async () => {
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Match quality score: 0.85')).toBeInTheDocument();
      });
    });
  });

  describe('Regular user view - with White Elephant results', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'user-456' } },
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockProfile, id: 'user-456' },
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockGroup, created_by: 'different-user' },
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(mockWhiteElephantResults);
    });

    it('shows user position for White Elephant', async () => {
      render(<ResultsPage />);

      // Wait for page to load - use a non-RainbowText element as anchor
      await waitFor(() => {
        expect(screen.getByText('White Elephant Order')).toBeInTheDocument();
      });

      // user-456 is second in the play order
      expect(screen.getByText("You're picking:")).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('Out of 3 participants')).toBeInTheDocument();
    });
  });

  describe('Admin view', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockGroup, // created_by matches mockUser.id
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(null);
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([mockPreferences]);
    });

    it('shows admin view with Calculate Statistics button', async () => {
      render(<ResultsPage />);

      // Note: "Admin: Run Algorithms" uses RainbowText, so look for the button instead
      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      // Also verify the description text is present
      expect(screen.getByText('Calculate statistics and choose the best matching algorithm for your group')).toBeInTheDocument();
    });

    it('shows previously finalized results notice', async () => {
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(mockMatchResults);
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Results Already Finalized!')).toBeInTheDocument();
        expect(screen.getByText(/You've already run the matching with/)).toBeInTheDocument();
      });
    });
  });

  describe('Admin - Calculate Statistics', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockGroup,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(null);
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([mockPreferences]);
      vi.mocked(ApiService.recalculate).mockResolvedValue(mockStatistics);
    });

    it('calculates and displays statistics when clicking Calculate button', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(ApiService.recalculate).toHaveBeenCalled();
        expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      });

      // Check that all algorithms are shown
      expect(screen.getByText('random')).toBeInTheDocument();
      expect(screen.getByText('max_utility')).toBeInTheDocument();
      expect(screen.getByText('max_fairness')).toBeInTheDocument();
      expect(screen.getByText('white_elephant')).toBeInTheDocument();
    });

    it('shows warning toast when no preferences exist', async () => {
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([]);
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText(/No preferences found/)).toBeInTheDocument();
      });
    });

    it('shows error toast when API call fails', async () => {
      vi.mocked(ApiService.recalculate).mockRejectedValue(new Error('API Error'));
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Failed to calculate statistics. Make sure the API is running.')).toBeInTheDocument();
      });
    });

    it('shows loading state while calculating', async () => {
      vi.mocked(ApiService.recalculate).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStatistics), 100))
      );
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      expect(screen.getByText('Calculating...')).toBeInTheDocument();
    });
  });

  describe('Admin - Algorithm Selection and Finalization', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = vi.fn((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          };
        }
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockGroup,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabaseClient.from = fromMock;
      vi.mocked(SupabaseService.getMatchResults).mockResolvedValue(null);
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([mockPreferences]);
      vi.mocked(SupabaseService.saveMatchResults).mockResolvedValue(undefined);
      vi.mocked(SupabaseService.getGroupMembersWithEmails).mockResolvedValue([]);
      vi.mocked(ApiService.recalculate).mockResolvedValue(mockStatistics);
      vi.mocked(ApiService.finalize).mockResolvedValue(mockFinalizeResponse);
      vi.mocked(ApiService.sendNotifications).mockResolvedValue({
        group_id: 'group-456',
        total_sent: 0,
        total_failed: 0,
        success: [],
        failed: [],
        message: '',
      });
    });

    it('allows selecting an algorithm', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      });

      // Select max_utility radio button
      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[1]); // max_utility is second

      expect(radioButtons[1]).toBeChecked();
    });

    it('disables Finalize button when no algorithm is selected', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Finalize Match')).toBeInTheDocument();
      });

      // The Finalize button should be disabled when no algorithm is selected
      const finalizeButton = screen.getByText('Finalize Match');
      expect(finalizeButton).toBeDisabled();
    });

    it('finalizes match after confirmation', async () => {
      const user = userEvent.setup();
      vi.mocked(global.confirm).mockReturnValue(true);
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      });

      // Select an algorithm
      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[1]);

      // Click finalize
      await user.click(screen.getByText('Finalize Match'));

      await waitFor(() => {
        expect(ApiService.finalize).toHaveBeenCalled();
        expect(SupabaseService.saveMatchResults).toHaveBeenCalled();
      });

      // Should show final results - title includes the ruleset name
      await waitFor(() => {
        expect(screen.getByText(/Final Results - max_utility/)).toBeInTheDocument();
        expect(screen.getByText('Secret Santa Pairings:')).toBeInTheDocument();
      });
    });

    it('does not finalize when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      vi.mocked(global.confirm).mockReturnValue(false);
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      });

      // Select an algorithm
      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[1]);

      // Click finalize
      await user.click(screen.getByText('Finalize Match'));

      expect(ApiService.finalize).not.toHaveBeenCalled();
    });

    it('displays metrics explanation', async () => {
      const user = userEvent.setup();
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Calculate Statistics')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calculate Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Understanding the Metrics:')).toBeInTheDocument();
        // Text is split by <strong> tags, so we need to check for the strong text separately
        expect(screen.getByText('Avg Utility:')).toBeInTheDocument();
        expect(screen.getByText('Min Utility:')).toBeInTheDocument();
        expect(screen.getByText('Fairness Score:')).toBeInTheDocument();
        // And verify explanatory text is present
        expect(screen.getByText(/Higher is better - overall match quality/)).toBeInTheDocument();
        expect(screen.getByText(/Higher is better - ensures no one gets a bad match/)).toBeInTheDocument();
        expect(screen.getByText(/Lower is better - more equal distribution/)).toBeInTheDocument();
      });
    });
  });
});
