'use client';

import { useEffect, useRef, useState } from 'react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart, type CartItem as CartLine } from '@/context/CartContext';
import styles from './page.module.scss';

/** Lines that can show above the fold on a phone; one of their images is the LCP. */
const PRIORITY_IMAGES = 2;

// Screen readers skip a live region update with identical text, so every other
// announcement ends with a no-break space and removing a twin line is heard too.
const NBSP = ' ';

/** Where the focus goes once the removal renders: a line's "Eliminar" or the title. */
type FocusTarget = { lineId: string } | 'title';

/** `/cart`: title, lines and footer, with focus management after removing a line. */
export default function CartPage() {
  const { items, count, total, hydrated, remove } = useCart();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<FocusTarget | null>(null);
  const [removed, setRemoved] = useState({ name: '', times: 0 });
  // Lines fading out after "Eliminar"; they leave the cart once the fade ends.
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const element =
      target === 'title' ? titleRef.current : removeButtons.current.get(target.lineId);
    element?.focus();
  }, [items]);

  const startRemoving = (item: CartLine) =>
    setLeaving((lineIds) => new Set(lineIds).add(item.lineId));

  const finishRemoving = (item: CartLine) => {
    // The neighbour must stay in the cart: skip lines that are fading out too.
    const staying = items.filter(({ lineId }) => lineId === item.lineId || !leaving.has(lineId));
    const index = staying.findIndex(({ lineId }) => lineId === item.lineId);
    const neighbour = staying[index + 1] ?? staying[index - 1];
    pendingFocus.current = neighbour ? { lineId: neighbour.lineId } : 'title';
    remove(item.lineId);
    setLeaving((lineIds) => {
      const next = new Set(lineIds);
      next.delete(item.lineId);
      return next;
    });
    setRemoved(({ times }) => ({ name: item.name, times: times + 1 }));
  };

  const registerRemoveButton = (lineId: string) => (button: HTMLButtonElement | null) => {
    if (button) removeButtons.current.set(lineId, button);
    else removeButtons.current.delete(lineId);
  };

  const announcement =
    removed.times === 0
      ? ''
      : `${removed.name} removed from cart${removed.times % 2 === 0 ? NBSP : ''}`;

  // Until the persisted cart is read, only the title; "CART (0)" would be a lie.
  if (!hydrated) {
    return (
      <div className={styles.cart} aria-busy="true">
        <h1 className={styles.title}>CART</h1>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        {`CART (${count})`}
      </h1>
      {count > 0 && (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <CartItem
              key={item.lineId}
              item={item}
              onRemove={startRemoving}
              leaving={leaving.has(item.lineId)}
              onLeft={finishRemoving}
              removeRef={registerRemoveButton(item.lineId)}
              priority={index < PRIORITY_IMAGES}
            />
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <CartSummary
          count={count}
          total={total}
          emptying={items.every(({ lineId }) => leaving.has(lineId))}
        />
      </div>
      <p role="status" className={styles.visuallyHidden} data-testid="cart-announcer">
        {announcement}
      </p>
    </div>
  );
}
