'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import styles from './CartSummary.module.scss';

type CartSummaryProps = {
  /** Number of lines: TOTAL and PAY only exist while there is at least one. */
  count: number;
  total: number;
  /** The last line is fading out: TOTAL and PAY fade out with it. */
  emptying?: boolean;
};

/** Cart footer: TOTAL, CONTINUE SHOPPING and PAY (no real checkout in this demo). */
export function CartSummary({ count, total, emptying = false }: CartSummaryProps) {
  const [message, setMessage] = useState('');
  const hasLines = count > 0;

  return (
    <div className={styles.summary}>
      {hasLines && (
        <p className={styles.total} data-leaving={emptying || undefined}>
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </p>
      )}
      <div className={styles.actions}>
        <Link href="/" className={styles.continue}>
          CONTINUE SHOPPING
        </Link>
        {hasLines && (
          <button
            type="button"
            className={styles.pay}
            data-leaving={emptying || undefined}
            onClick={() => setMessage('Payment is not available in this demo')}
          >
            PAY
          </button>
        )}
      </div>
      {/* Always rendered, so the first announcement is not lost; emptied once PAY disappears. */}
      <p role="status" className={styles.message}>
        {hasLines ? message : ''}
      </p>
    </div>
  );
}
