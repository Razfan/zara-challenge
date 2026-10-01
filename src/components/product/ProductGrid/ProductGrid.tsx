import type { ProductListItem } from '@/lib/types';
import { FlipList } from '../FlipList';
import { ProductCard } from '../ProductCard';
import styles from './ProductGrid.module.scss';

/**
 * Cards that can show in the first viewport: two desktop rows of 5. The second row peeks
 * in on a laptop screen and one of its images can be the LCP.
 */
const PRIORITY_IMAGES = 10;

type ProductGridProps = { products: readonly ProductListItem[] };

/** Responsive grid of product cards with shared 0.5px borders. After a search, the cards
 * that stay glide to their new cell. */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <FlipList ids={products.map(({ id }) => id)} className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < PRIORITY_IMAGES} />
      ))}
    </FlipList>
  );
}
