import Image from 'next/image';
import Link from 'next/link';
import type { ProductListItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import styles from './ProductCard.module.scss';

// Rendered width per breakpoint, matching the grid columns (1 / 2 / 4 / 5).
const IMAGE_SIZES =
  '(min-width: 1440px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw';

type ProductCardProps = {
  product: ProductListItem;
  /** Loads the image eagerly with high priority: cards in the first viewport. */
  priority?: boolean;
};

/** One grid cell: a single link to the detail page. */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const price = formatPrice(product.basePrice);

  return (
    <li className={styles.cell}>
      <Link
        href={`/product/${product.id}`}
        className={styles.card}
        aria-label={`${product.brand} ${product.name}, ${price}`}
      >
        <div className={styles.imageWrapper}>
          {/* Decorative: the link name already describes the product. */}
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes={IMAGE_SIZES}
            priority={priority}
            className={styles.image}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.titles}>
            <span className={styles.brand}>{product.brand}</span>
            <span className={styles.name}>{product.name}</span>
          </div>
          <span className={styles.price}>{price}</span>
        </div>
      </Link>
    </li>
  );
}
