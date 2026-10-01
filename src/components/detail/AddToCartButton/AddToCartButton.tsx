'use client';

import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { useCart } from '@/context/CartContext';
import type { ColorOption, Product, StorageOption } from '@/lib/types';
import styles from './AddToCartButton.module.scss';

type AddToCartButtonProps = {
  product: Product;
  storage: StorageOption | undefined;
  color: ColorOption | undefined;
};

/** "AÑADIR": `aria-disabled` rather than `disabled` so it stays focusable and can
 * explain what is missing. Adds one cart line per press and, as in the Figma
 * prototype, takes the user to the cart. */
export function AddToCartButton({ product, storage, color }: AddToCartButtonProps) {
  const { add } = useCart();
  const router = useRouter();
  const hintId = useId();
  const ready = storage !== undefined && color !== undefined;

  const handleClick = () => {
    if (!storage || !color) return;
    add({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      imageUrl: color.imageUrl,
      color: { name: color.name, hexCode: color.hexCode },
      storage,
    });
    router.push('/cart');
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        aria-disabled={!ready}
        aria-describedby={ready ? undefined : hintId}
        onClick={handleClick}
      >
        <span lang="es">AÑADIR</span>
      </button>
      {!ready && (
        <span id={hintId} className={styles.visuallyHidden}>
          Select storage and color
        </span>
      )}
    </div>
  );
}
