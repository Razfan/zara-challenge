import { render, renderHook, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingBar } from '@/components/layout/LoadingBar';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { NavigationProgressProvider } from './NavigationProgressContext';

function StartButton({ until }: { until: Promise<void> }) {
  const { startTransition } = useNavigationProgress();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await until;
        })
      }
    >
      Search
    </button>
  );
}

describe('NavigationProgressProvider', () => {
  it('shows the loading bar while a navigation transition is pending', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const until = new Promise<void>((resolve) => {
      finish = resolve;
    });
    render(
      <NavigationProgressProvider>
        <LoadingBar />
        <StartButton until={until} />
      </NavigationProgressProvider>,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    finish();
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
  });

  it('fails loudly when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useNavigationProgress())).toThrow(
      'useNavigationProgress must be used within NavigationProgressProvider',
    );
    consoleError.mockRestore();
  });
});
