import styles from './ResultsCount.module.scss';

/** "<n> RESULTS" under the search bar; a polite live region so updates are announced. */
export function ResultsCount({ count }: { count: number }) {
  return (
    <p className={styles.resultsCount} aria-live="polite">
      {count} RESULTS
    </p>
  );
}
