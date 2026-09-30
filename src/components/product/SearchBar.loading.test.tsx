import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { Suspense, use, useState, type Dispatch, type SetStateAction } from 'react';
import { LoadingBar } from '@/components/layout/LoadingBar';
import { NavigationProgressProvider } from '@/context/NavigationProgressContext';
import { SearchBar } from './SearchBar';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// Stands in for the App Router: `router.replace` updates the URL inside the caller's
// transition, and the new page suspends until its data arrives.
let setUrl!: Dispatch<SetStateAction<string>>;
let resolveResults!: () => void;
let searchResults: Promise<void>;

function Page({ url }: { url: string }) {
  if (url !== '/') use(searchResults);
  return <p>Results for {url}</p>;
}

function FakeRouterApp() {
  const [url, setCurrentUrl] = useState('/');
  setUrl = setCurrentUrl;
  return (
    <NavigationProgressProvider>
      <LoadingBar />
      <SearchBar initialValue="" />
      <Suspense fallback={<p>Loading page</p>}>
        <Page url={url} />
      </Suspense>
    </NavigationProgressProvider>
  );
}

describe('SearchBar + LoadingBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    searchResults = new Promise<void>((resolve) => {
      resolveResults = resolve;
    });
    jest.mocked(useRouter).mockReturnValue({
      replace: (href: string) => setUrl(href),
    } as unknown as ReturnType<typeof useRouter>);
  });
  afterEach(() => jest.useRealTimers());

  it('shows the loading bar while the search results are loading', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<FakeRouterApp />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await act(() => jest.advanceTimersByTime(300));

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    // Inside a transition the previous results stay on screen instead of a fallback.
    expect(screen.getByText('Results for /')).toBeInTheDocument();

    await act(async () => resolveResults());

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Results for /?search=samsung')).toBeInTheDocument();
  });
});
