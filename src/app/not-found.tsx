import Link from 'next/link';
import styles from './status.module.scss';

/** App 404, also rendered by the product page when the API returns 404. */
export default function NotFound() {
  return (
    <section className={styles.status} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className={styles.title}>
        Page not found
      </h1>
      <p className={styles.message}>The page you are looking for does not exist.</p>
      <Link href="/" className={styles.action}>
        BACK TO HOME
      </Link>
    </section>
  );
}
