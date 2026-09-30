import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { NavigationProgressProvider } from '@/context/NavigationProgressContext';
import { LoadingBar } from './LoadingBar';

describe('LoadingBar', () => {
  it('renders nothing while no navigation is pending', () => {
    render(
      <NavigationProgressProvider>
        <LoadingBar />
      </NavigationProgressProvider>,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('is always visible when forced active (route loading.tsx)', async () => {
    const { container } = render(
      <NavigationProgressProvider>
        <LoadingBar active />
      </NavigationProgressProvider>,
    );

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
