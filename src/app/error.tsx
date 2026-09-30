'use client';

import { useEffect, useRef } from 'react';
import styles from './status.module.scss';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Shown when a server component throws, e.g. the products API fails or times out. */
export default function ErrorPage({ reset }: ErrorPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The view can replace the page after a client navigation: moving focus announces it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={styles.status} aria-labelledby="error-title">
      <h1 id="error-title" ref={headingRef} tabIndex={-1} className={styles.title}>
        Something went wrong
      </h1>
      <p className={styles.message}>We could not load this page. Please try again.</p>
      <button type="button" className={styles.action} onClick={reset}>
        RETRY
      </button>
    </section>
  );
}
