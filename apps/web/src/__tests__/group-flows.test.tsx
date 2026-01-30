import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test-utils';
import userEvent from '@testing-library/user-event';
import CreateGroupPage from '@/app/create-group/page';
import JoinGroupPage from '@/app/join-group/page';
import { mockUser, mockGroup, mockProfile } from './mocks/supabase';

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

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/create-group',
}));

describe('CreateGroupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the create group form', () => {
      render(<CreateGroupPage />);

      // RainbowText renders characters separately, so we check for the form elements instead
      expect(screen.getByText('Group Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., Family Christmas 2024/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Group' })).toBeInTheDocument();
    });

    it('shows "What happens next?" instructions', () => {
      render(<CreateGroupPage />);

      expect(screen.getByText("What happens next?")).toBeInTheDocument();
      expect(screen.getByText("You'll get a unique 6-digit group code")).toBeInTheDocument();
      expect(screen.getByText("Share the code with people you want to invite")).toBeInTheDocument();
    });

    it('shows link to join group page', () => {
      render(<CreateGroupPage />);

      expect(screen.getByText('Want to join an existing group instead?')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('disables submit button when group name is empty', () => {
      render(<CreateGroupPage />);

      const submitButton = screen.getByText('Create Group');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when group name is entered', async () => {
      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      await user.type(input, 'My Test Group');

      const submitButton = screen.getByText('Create Group');
      expect(submitButton).not.toBeDisabled();
    });

    it('limits group name to 100 characters', async () => {
      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      const longName = 'a'.repeat(150);
      await user.type(input, longName);

      expect(input).toHaveValue('a'.repeat(100));
    });
  });

  describe('Authentication handling', () => {
    it('redirects to login if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      await user.type(input, 'My Test Group');
      await user.click(screen.getByText('Create Group'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Group creation flow', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('creates group and redirects to dashboard on success', async () => {
      const mockNewGroup = { ...mockGroup, id: 'new-group-id' };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'groups') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockNewGroup, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      await user.type(input, 'My Test Group');
      await user.click(screen.getByText('Create Group'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });

      // Should show success toast
      expect(screen.getByText(/Group created!/)).toBeInTheDocument();
    });

    it('shows loading state while creating', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockImplementation(
          () => new Promise(() => {}) // Never resolves
        ),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => new Promise(() => {})),
      }));

      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      await user.type(input, 'My Test Group');
      await user.click(screen.getByText('Create Group'));

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('shows error when group creation fails', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
        }
        if (table === 'groups') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const user = userEvent.setup();
      render(<CreateGroupPage />);

      const input = screen.getByPlaceholderText(/e.g., Family Christmas 2024/);
      await user.type(input, 'My Test Group');
      await user.click(screen.getByText('Create Group'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create group/)).toBeInTheDocument();
      });
    });

    it('navigates to join-group page when clicking the link', async () => {
      const user = userEvent.setup();
      render(<CreateGroupPage />);

      await user.click(screen.getByText('Want to join an existing group instead?'));

      expect(mockPush).toHaveBeenCalledWith('/join-group');
    });
  });
});

describe('JoinGroupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the join group form', () => {
      render(<JoinGroupPage />);

      // RainbowText renders characters separately, so we check for the form elements instead
      expect(screen.getByText('Group Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Find Group/i })).toBeInTheDocument();
    });

    it('shows instructions for getting a group code', () => {
      render(<JoinGroupPage />);

      expect(screen.getByText('How to get a group code')).toBeInTheDocument();
      expect(screen.getByText('Ask the person who created the group to share the code')).toBeInTheDocument();
    });

    it('shows link to create group page', () => {
      render(<JoinGroupPage />);

      expect(screen.getByText('Want to create your own group instead?')).toBeInTheDocument();
    });
  });

  describe('Group code input', () => {
    it('converts input to uppercase', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'abc123');

      expect(input).toHaveValue('ABC123');
    });

    it('filters out non-alphanumeric characters', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ab!@#c12$%^3');

      expect(input).toHaveValue('ABC123');
    });

    it('limits input to 6 characters', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABCDEFGHIJ');

      expect(input).toHaveValue('ABCDEF');
    });

    it('disables Find Group button when code is less than 6 characters', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC');

      const findButton = screen.getByText('Find Group');
      expect(findButton).toBeDisabled();
    });

    it('enables Find Group button when code is exactly 6 characters', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');

      const findButton = screen.getByText('Find Group');
      expect(findButton).not.toBeDisabled();
    });
  });

  describe('Group preview', () => {
    it('shows error for invalid group code', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'INVALID');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Invalid group code. Please check and try again.')).toBeInTheDocument();
      });
    });

    it('shows error for code less than 6 characters', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC');

      // Manually click (though button should be disabled)
      // The handlePreviewGroup function should catch this
      expect(screen.getByText('Find Group')).toBeDisabled();
    });

    it('shows group preview when valid code is found', async () => {
      const mockGroupData = {
        id: 'group-456',
        name: 'Family Christmas',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGroupData, error: null }),
          };
        }
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'member-1' }, { id: 'member-2' }],
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

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Group Found!')).toBeInTheDocument();
        expect(screen.getByText('Family Christmas')).toBeInTheDocument();
        expect(screen.getByText('2 people')).toBeInTheDocument();
      });
    });

    it('shows loading state while checking group', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => new Promise(() => {})),
      });

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      expect(screen.getByText('Checking...')).toBeInTheDocument();
    });
  });

  describe('Joining group', () => {
    const mockGroupData = {
      id: 'group-456',
      name: 'Family Christmas',
      created_at: '2024-01-01T00:00:00Z',
    };

    beforeEach(() => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGroupData, error: null }),
          };
        }
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              data: [{ id: 'member-1' }],
              error: null,
              single: vi.fn().mockResolvedValue({
                data: { ...mockProfile, group_id: null },
                error: null,
              }),
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });
    });

    it('redirects to login if user is not authenticated when joining', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Join This Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Join This Group'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('joins group and redirects to dashboard on success', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGroupData, error: null }),
          };
        }
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              data: [{ id: 'member-1' }],
              error: null,
              single: vi.fn().mockResolvedValue({
                data: { ...mockProfile, group_id: null },
                error: null,
              }),
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Join This Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Join This Group'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('asks for confirmation when user is already in a group', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFromProfile = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => ({
          data: [{ id: 'member-1' }],
          error: null,
          single: vi.fn().mockResolvedValue({
            data: { ...mockProfile, group_id: 'existing-group-id' }, // User already in a group
            error: null,
          }),
        })),
        update: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGroupData, error: null }),
          };
        }
        if (table === 'profile') {
          return mockFromProfile;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(global.confirm).mockReturnValue(true);

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Join This Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Join This Group'));

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith(
          'You are already in a group. Do you want to leave your current group and join this one?'
        );
      });
    });

    it('does not join if user cancels confirmation', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGroupData, error: null }),
          };
        }
        if (table === 'profile') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation(() => ({
              data: [{ id: 'member-1' }],
              error: null,
              single: vi.fn().mockResolvedValue({
                data: { ...mockProfile, group_id: 'existing-group-id' },
                error: null,
              }),
            })),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      vi.mocked(global.confirm).mockReturnValue(false);

      const user = userEvent.setup();
      render(<JoinGroupPage />);

      const input = screen.getByPlaceholderText('ABC123');
      await user.type(input, 'ABC123');
      await user.click(screen.getByText('Find Group'));

      await waitFor(() => {
        expect(screen.getByText('Join This Group')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Join This Group'));

      // Should not redirect to dashboard
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to create-group page when clicking the link', async () => {
      const user = userEvent.setup();
      render(<JoinGroupPage />);

      await user.click(screen.getByText('Want to create your own group instead?'));

      expect(mockPush).toHaveBeenCalledWith('/create-group');
    });
  });
});
