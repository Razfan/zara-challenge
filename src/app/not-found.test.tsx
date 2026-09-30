import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import NotFound from './not-found';

describe('NotFound (app/not-found.tsx)', () => {
  it('shows the app 404 page with a link back to /', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'BACK TO HOME' })).toHaveAttribute('href', '/');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NotFound />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
