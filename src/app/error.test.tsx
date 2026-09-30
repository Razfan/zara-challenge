import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import ErrorPage from './error';

describe('ErrorPage (app/error.tsx)', () => {
  it('shows a heading and message, and moves focus to the heading', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toHaveFocus();
    expect(screen.getByText('We could not load this page. Please try again.')).toBeInTheDocument();
  });

  it('calls reset when RETRY is pressed', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'RETRY' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
