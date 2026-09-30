'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { BagIcon } from './BagIcon';
import { Logo } from './Logo';
import styles from './Navbar.module.scss';

export function Navbar() {
  const { count } = useCart();
  const pathname = usePathname();
  const filled = count > 0;

  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo} aria-label="Home">
        <Logo />
      </Link>
      {pathname !== '/cart' && (
        <Link
          href="/cart"
          className={styles.cart}
          aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          data-filled={filled}
        >
          <BagIcon filled={filled} />
          <span>{count}</span>
        </Link>
      )}
    </header>
  );
}
