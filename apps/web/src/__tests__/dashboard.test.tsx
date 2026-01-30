import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from './test-utils';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';
import {
  mockUser,
  mockProfile,
  mockGroup,
  mockGroupMembers,
  mockPreferences,
} from './mocks/supabase';

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

// Mock the SupabaseService
vi.mock('@/services/supabase.service', () => ({
  SupabaseService: {
    getGroupPreferences: vi.fn(),
    savePreferences: vi.fn(),
    getGroupMembers: vi.fn(),
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
  usePathname: () => '/dashboard',
}));

import { SupabaseService } from '@/services/supabase.service';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication state handling', () => {
    it('redirects to login when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('shows loading spinner while checking authentication', () => {
      mockSupabaseClient.auth.getUser.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<DashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading your preferences...')).toBeInTheDocument();
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

    it('shows create/join group options when user has no group', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("You're not part of a group yet. Let's get you started!")).toBeInTheDocument();
      });

      expect(screen.getByText('Create a Group')).toBeInTheDocument();
      expect(screen.getByText('Join a Group')).toBeInTheDocument();
    });

    it('navigates to create-group page when clicking Create a Group', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Create a Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create a Group'));
      expect(mockPush).toHaveBeenCalledWith('/create-group');
    });

    it('navigates to join-group page when clicking Join a Group', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Join a Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Join a Group'));
      expect(mockPush).toHaveBeenCalledWith('/join-group');
    });
  });

  describe('Preference form when user has a group', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([mockPreferences]);
      vi.mocked(SupabaseService.getGroupMembers).mockResolvedValue(mockGroupMembers);
    });

    it('renders preference form with all sections', async () => {
      render(<DashboardPage />);

      // Wait for page to load by checking for a section header
      // Note: The main title "Your Gift Preferences" uses RainbowText which splits text across elements
      await waitFor(() => {
        expect(screen.getByText('Giving Preferences')).toBeInTheDocument();
      });

      // Check all sections are present
      expect(screen.getByText('Receiving Preferences')).toBeInTheDocument();
      expect(screen.getByText('White Elephant Preferences')).toBeInTheDocument();
      expect(screen.getByText('Your Interests')).toBeInTheDocument();
      expect(screen.getByText('Group Members')).toBeInTheDocument();
      expect(screen.getByText("Don't Match Me With")).toBeInTheDocument();
    });

    it('loads and displays user preferences', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(SupabaseService.getGroupPreferences).toHaveBeenCalledWith('group-456');
      });

      // Check that interests are displayed
      await waitFor(() => {
        expect(screen.getByText('hiking')).toBeInTheDocument();
        expect(screen.getByText('cooking')).toBeInTheDocument();
      });
    });

    it('displays group members', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(SupabaseService.getGroupMembers).toHaveBeenCalledWith('group-456');
      });

      await waitFor(() => {
        expect(screen.getByText('User user-123...')).toBeInTheDocument();
      });
    });
  });

  describe('Preference form interactions', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([]);
      vi.mocked(SupabaseService.getGroupMembers).mockResolvedValue(mockGroupMembers);
      vi.mocked(SupabaseService.savePreferences).mockResolvedValue(undefined);
    });

    it('allows adding interests', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('e.g., hiking, cooking, gaming...');
      const addButton = screen.getByText('Add');

      await user.type(input, 'photography');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('photography')).toBeInTheDocument();
      });
    });

    it('prevents adding duplicate interests', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('e.g., hiking, cooking, gaming...');
      const addButton = screen.getByText('Add');

      // Add first interest
      await user.type(input, 'photography');
      await user.click(addButton);

      // Try to add same interest again
      await user.type(input, 'photography');
      await user.click(addButton);

      // Should only appear once
      const photographyElements = screen.getAllByText('photography');
      expect(photographyElements).toHaveLength(1);
    });

    it('allows removing interests', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      // Add an interest
      const input = screen.getByPlaceholderText('e.g., hiking, cooking, gaming...');
      const addButton = screen.getByText('Add');
      await user.type(input, 'photography');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('photography')).toBeInTheDocument();
      });

      // Remove the interest (the × button is inside the same span)
      const interestTag = screen.getByText('photography').closest('span');
      const removeButton = interestTag?.querySelector('button');
      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('photography')).not.toBeInTheDocument();
      });
    });

    it('adds interest when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('e.g., hiking, cooking, gaming...');
      await user.type(input, 'gaming{Enter}');

      await waitFor(() => {
        expect(screen.getByText('gaming')).toBeInTheDocument();
      });
    });

    it('does not add empty interests', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add');
      await user.click(addButton);

      // Should still show the "No interests added yet" message
      expect(screen.getByText('No interests added yet')).toBeInTheDocument();
    });

    it('trims whitespace from interests', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Interests')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('e.g., hiking, cooking, gaming...');
      const addButton = screen.getByText('Add');

      await user.type(input, '  hiking  ');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('hiking')).toBeInTheDocument();
      });
    });
  });

  describe('Preference form submission', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([]);
      vi.mocked(SupabaseService.getGroupMembers).mockResolvedValue(mockGroupMembers);
    });

    it('saves preferences successfully', async () => {
      vi.mocked(SupabaseService.savePreferences).mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save Preferences'));

      await waitFor(() => {
        expect(SupabaseService.savePreferences).toHaveBeenCalled();
      });

      // Should show success toast
      await waitFor(() => {
        expect(screen.getByText('Preferences saved successfully!')).toBeInTheDocument();
      });
    });

    it('shows loading state while saving', async () => {
      vi.mocked(SupabaseService.savePreferences).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save Preferences'));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows error toast when save fails', async () => {
      vi.mocked(SupabaseService.savePreferences).mockRejectedValue(
        new Error('Database connection failed')
      );
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save Preferences'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to save preferences: Database connection failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Exclusion toggles', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });
      vi.mocked(SupabaseService.getGroupPreferences).mockResolvedValue([]);
      vi.mocked(SupabaseService.getGroupMembers).mockResolvedValue(mockGroupMembers);
    });

    it('shows exclusion checkboxes for other group members (not self)', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Don't Match Me With")).toBeInTheDocument();
      });

      // Should show checkboxes for other members but not for self
      const checkboxes = screen.getAllByRole('checkbox');

      // mockGroupMembers has 3 members, current user is user-123
      // So we should see 2 checkboxes (for user-456 and user-789)
      expect(checkboxes).toHaveLength(2);
    });

    it('allows toggling exclusions', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Don't Match Me With")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');

      // Toggle first checkbox
      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();

      // Toggle again to uncheck
      await user.click(checkboxes[0]);
      expect(checkboxes[0]).not.toBeChecked();
    });
  });
});
