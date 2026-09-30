import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ResultsCount } from './ResultsCount';

describe('ResultsCount', () => {
  it('shows the number of results as "<n> RESULTS"', () => {
    render(<ResultsCount count={20} />);

    expect(screen.getByText('20 RESULTS')).toBeInTheDocument();
  });

  it('announces changes politely to assistive technologies', () => {
    const { rerender } = render(<ResultsCount count={20} />);
    const region = screen.getByText('20 RESULTS');
    expect(region).toHaveAttribute('aria-live', 'polite');

    rerender(<ResultsCount count={6} />);

    // Same live region, new text: that is what screen readers announce.
    expect(screen.getByText('6 RESULTS')).toBe(region);
  });

  it('shows "0 RESULTS" when the search finds nothing', async () => {
    const { container } = render(<ResultsCount count={0} />);

    expect(screen.getByText('0 RESULTS')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
