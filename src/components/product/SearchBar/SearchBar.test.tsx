import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderToString } from 'react-dom/server';
import { useRouter } from 'next/navigation';
import { NavigationProgressProvider } from '@/context/NavigationProgressContext';
import { SearchBar } from './SearchBar';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const replace = jest.fn();
jest.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);

const renderSearchBar = (initialValue = '') => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const view = render(<SearchBar initialValue={initialValue} />, {
    wrapper: NavigationProgressProvider,
  });
  return { user, ...view };
};

const waitDebounce = (ms = 300) => act(() => jest.advanceTimersByTime(ms));

describe('SearchBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows a labelled search field with the Figma placeholder', async () => {
    const { container } = renderSearchBar();

    const input = screen.getByRole('searchbox', { name: 'Search for a smartphone' });
    expect(input).toHaveAttribute('placeholder', 'Search for a smartphone...');
    expect(screen.getByRole('search')).toContainElement(input);
    jest.useRealTimers();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('updates the URL to /?search=<term> after 300 ms without typing', async () => {
    const { user } = renderSearchBar();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitDebounce(299);
    expect(replace).not.toHaveBeenCalled();

    await waitDebounce(1);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/?search=samsung', { scroll: false });
  });

  it('encodes the trimmed term in the URL', async () => {
    const { user } = renderSearchBar();

    await user.type(screen.getByRole('searchbox'), ' galaxy s24 ');
    await waitDebounce();

    expect(replace).toHaveBeenCalledWith('/?search=galaxy+s24', { scroll: false });
  });

  it('removes the search param when the term is emptied', async () => {
    const { user } = renderSearchBar('samsung');

    await user.clear(screen.getByRole('searchbox'));
    await waitDebounce();

    expect(replace).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('shows an accessible clear button only while the field has text', async () => {
    const { user } = renderSearchBar();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'a');

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('clears the search and returns focus to the field', async () => {
    const { user } = renderSearchBar('samsung');
    const input = screen.getByRole('searchbox');

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    await waitDebounce();
    expect(replace).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('starts with the term from the URL and does not navigate on load', async () => {
    renderSearchBar('samsung');

    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
    await waitDebounce();
    expect(replace).not.toHaveBeenCalled();
  });

  it('keeps typing when the results of an earlier term arrive', async () => {
    const { user, rerender } = renderSearchBar();
    const input = screen.getByRole('searchbox');

    await user.type(input, 'sam');
    await waitDebounce();
    await user.type(input, 'sung');
    // The page re-renders with the URL of the first search while the user keeps typing.
    rerender(<SearchBar initialValue="sam" />);

    expect(input).toHaveValue('samsung');
    await waitDebounce();
    expect(replace).toHaveBeenLastCalledWith('/?search=samsung', { scroll: false });
    expect(replace).toHaveBeenCalledTimes(2);
  });

  it('shows the URL term when the search changes from outside (e.g. the logo link)', async () => {
    const { rerender } = renderSearchBar('samsung');

    rerender(<SearchBar initialValue="" />);

    expect(screen.getByRole('searchbox')).toHaveValue('');
    await waitDebounce();
    expect(replace).not.toHaveBeenCalled();
  });

  it('keeps what the user typed before the page hydrated', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <NavigationProgressProvider>
        <SearchBar initialValue="" />
      </NavigationProgressProvider>,
    );
    document.body.appendChild(container);
    // Typed into the server-rendered field before React takes over.
    screen.getByRole<HTMLInputElement>('searchbox').value = 'samsung';

    render(<SearchBar initialValue="" />, {
      container,
      hydrate: true,
      wrapper: NavigationProgressProvider,
    });

    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    await waitDebounce();
    expect(replace).toHaveBeenCalledWith('/?search=samsung', { scroll: false });
  });
});
