import Link from 'next/link';
import { ChevronLeftIcon } from './ChevronLeftIcon';
import styles from './BackLink.module.scss';

/** "BACK": a plain link to / so a direct entry or a modified click still work. */
export function BackLink() {
  return (
    <Link href="/" className={styles.backLink}>
      <ChevronLeftIcon />
      BACK
    </Link>
  );
}
