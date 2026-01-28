import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Test component that uses the toast hook
function TestToastComponent() {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Show Warning
      </button>
    </div>
  );
}

describe('Toast Component', () => {
  it('renders ToastProvider without errors', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestToastComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });

  it('shows success toast when triggered', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error toast when triggered', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows info toast when triggered', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('shows warning toast when triggered', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('displays correct icon for success toast', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Success'));

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('displays correct icon for error toast', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Error'));

    // Error icon is ✕
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('✕');
  });

  it('has a dismiss button when showing a toast', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Verify dismiss button exists
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  it('can show multiple toasts in quick succession', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    );

    // Click all three buttons
    await user.click(screen.getByText('Show Success'));
    await user.click(screen.getByText('Show Error'));
    await user.click(screen.getByText('Show Warning'));

    // All messages should be visible
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });
});

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with medium size', () => {
    render(<LoadingSpinner size="md" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="border-red-500" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-red-500');
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner text="Loading..." />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('has animation class', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });
});
