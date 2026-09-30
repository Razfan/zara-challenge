import { notFound } from 'next/navigation';
import { BackLink } from '@/components/detail/BackLink';
import { ProductConfigurator } from '@/components/detail/ProductConfigurator';
import { SimilarProducts } from '@/components/detail/SimilarProducts';
import { SpecsTable } from '@/components/detail/SpecsTable';
import { getProductById } from '@/lib/products';
import styles from './page.module.scss';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

/** `/product/<id>`: server-rendered detail page; the app 404 if the API has no such product. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <BackLink />
      <div className={styles.content}>
        <ProductConfigurator product={product} />
        <SpecsTable product={product} />
        <SimilarProducts products={product.similarProducts} />
      </div>
    </div>
  );
}
