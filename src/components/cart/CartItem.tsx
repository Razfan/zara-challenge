'use client';

import Image from 'next/image';
import { type Ref, useRef } from 'react';
import type { CartItem as CartLine } from '@/context/CartContext';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { formatPrice } from '@/lib/utils';
import styles from './CartItem.module.scss';

type CartItemProps = {
  item: CartLine;
  /** "Eliminar" was pressed: the line starts fading out. */
  onRemove: (item: CartLine) => void;
  /** Fading out: ignores further presses and calls `onLeft` once the fade has ended. */
  leaving?: boolean;
  onLeft?: (item: CartLine) => void;
  /** Lets the cart page move the focus to this line after removing another. */
  removeRef?: Ref<HTMLButtonElement>;
  /** Loads the image eagerly with high priority: lines above the fold, one is the LCP. */
  priority?: boolean;
};

/** One cart line: chosen color image, name, "<capacity> | <color>" and price. */
export function CartItem({
  item,
  onRemove,
  leaving = false,
  onLeft,
  removeRef,
  priority = false,
}: CartItemProps) {
  const lineRef = useRef<HTMLLIElement>(null);
  useExitAnimation(lineRef, leaving, () => onLeft?.(item));

  const removeLabel = `Eliminar ${item.name} ${item.storage.capacity} ${item.color.name}`;

  return (
    <li ref={lineRef} className={styles.item} data-leaving={leaving || undefined}>
      <div className={styles.imageWrapper}>
        {/* Decorative: the name, storage and color are right next to it. */}
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 262px, 40vw"
          priority={priority}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.details}>
          <div className={styles.titles}>
            <p>{item.name}</p>
            <p>{`${item.storage.capacity} | ${item.color.name}`}</p>
          </div>
          <p>{formatPrice(item.storage.price)}</p>
        </div>
        {/* The accessible name identifies the line, in Spanish like its visible text. */}
        <button
          ref={removeRef}
          type="button"
          className={styles.remove}
          lang="es"
          aria-label={removeLabel}
          onClick={() => {
            if (!leaving) onRemove(item);
          }}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
