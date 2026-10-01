'use client';

import { useState, type ReactNode } from 'react';
import type { ColorOption, Product, StorageOption } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '../AddToCartButton';
import { AnimatedText } from '../AnimatedText';
import { ColorSelector } from '../ColorSelector';
import { ProductImage } from '../ProductImage';
import { StorageSelector } from '../StorageSelector';
import styles from './ProductConfigurator.module.scss';

type ProductConfiguratorProps = {
  product: Product;
  /** The `<h1>`: static, so the page renders it and this client component only places it. */
  heading: ReactNode;
};

/** Image, name, price and selectors of the detail page. The selection is local and
 * ephemeral (not in Context); price and image are derived from it. */
export function ProductConfigurator({ product, heading }: ProductConfiguratorProps) {
  const [storage, setStorage] = useState<StorageOption>();
  const [color, setColor] = useState<ColorOption>();

  // "From" only while no storage is selected.
  const price = storage ? formatPrice(storage.price) : `From ${formatPrice(product.basePrice)}`;
  // The first color until the user picks one.
  const shownColor = color ?? product.colorOptions[0];

  return (
    <div className={styles.configurator}>
      <div className={styles.imageWrapper}>
        {shownColor && (
          <ProductImage
            src={shownColor.imageUrl}
            alt={`${product.brand} ${product.name}, ${shownColor.name}`}
          />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.heading}>
          {heading}
          <p className={styles.price} aria-live="polite" aria-atomic="true">
            <AnimatedText value={price} />
          </p>
        </div>
        <div className={styles.selectors}>
          <StorageSelector
            options={product.storageOptions}
            selected={storage}
            onSelect={setStorage}
          />
          <ColorSelector options={product.colorOptions} selected={color} onSelect={setColor} />
        </div>
        <AddToCartButton product={product} storage={storage} color={color} />
      </div>
    </div>
  );
}
