import { useId } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import type { ProductListItem } from '@/lib/types';
import styles from './SimilarProducts.module.scss';

type SimilarProductsProps = { products: readonly ProductListItem[] };

/** "SIMILAR ITEMS": native horizontal scroll with snap, so touch, trackpad and keyboard
 * (the region is focusable) all work without extra JS. */
export function SimilarProducts({ products }: SimilarProductsProps) {
  const titleId = useId();

  if (products.length === 0) return null;

  return (
    <section className={styles.similar}>
      <h2 id={titleId} className={styles.title}>
        SIMILAR ITEMS
      </h2>
      <div
        className={styles.carousel}
        role="region"
        aria-labelledby={titleId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- lets arrow keys scroll it
        tabIndex={0}
      >
        <ul className={styles.list}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
}
