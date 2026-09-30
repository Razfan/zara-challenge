import { ProductGrid } from '@/components/product/ProductGrid';
import { ResultsCount } from '@/components/product/ResultsCount';
import { SearchBar } from '@/components/product/SearchBar';
import { getProducts } from '@/lib/products';
import styles from './page.module.scss';

type HomePageProps = {
  searchParams: Promise<{ search?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search } = await searchParams;
  const term = (Array.isArray(search) ? search[0] : search) ?? '';
  const products = await getProducts(term);

  return (
    <div className={styles.home}>
      <div className={styles.search}>
        <SearchBar initialValue={term} />
        <ResultsCount count={products.length} />
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
