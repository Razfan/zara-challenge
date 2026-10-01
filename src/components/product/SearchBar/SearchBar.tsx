'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { CloseIcon } from './CloseIcon';
import styles from './SearchBar.module.scss';

/** Idle time before a search updates the URL. */
const SEARCH_DEBOUNCE_MS = 300;

const searchUrl = (term: string) => (term ? `/?${new URLSearchParams({ search: term })}` : '/');

type SearchBarProps = {
  /** The `search` param of the current URL, the source of truth. */
  initialValue: string;
};

/** Real-time search: the typed term goes to the URL after a debounce. */
export function SearchBar({ initialValue }: SearchBarProps) {
  const router = useRouter();
  const { startTransition } = useNavigationProgress();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const debounced = useDebounce(value, SEARCH_DEBOUNCE_MS);
  const urlTerm = initialValue.trim();

  // The URL can change without typing (e.g. the logo link to "/"): show its term, unless
  // it is just the term this field already asked for while the user keeps typing.
  const [syncedUrlTerm, setSyncedUrlTerm] = useState(urlTerm);
  if (urlTerm !== syncedUrlTerm) {
    setSyncedUrlTerm(urlTerm);
    if (urlTerm !== debounced.trim()) setValue(initialValue);
  }

  // Text typed into the server-rendered field before hydration lives only in the DOM:
  // its `defaultValue` is still the server value, so any difference was typed by the user.
  useEffect(() => {
    const input = inputRef.current;
    if (input && input.value !== input.defaultValue) setValue(input.value);
  }, []);

  useEffect(() => {
    // Still waiting for the user to stop typing, or the URL already matches.
    if (debounced !== value || debounced.trim() === urlTerm) return;
    // Shared transition: LoadingBar shows while the new results load.
    startTransition(() => router.replace(searchUrl(debounced.trim()), { scroll: false }));
  }, [debounced, value, urlTerm, router, startTransition]);

  const clear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div role="search" className={styles.searchBar}>
      <label htmlFor={inputId} className={styles.label}>
        Search for a smartphone
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        className={styles.input}
        placeholder="Search for a smartphone..."
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
