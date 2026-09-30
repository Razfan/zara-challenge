import { useId } from 'react';
import type { Product } from '@/lib/types';
import styles from './SpecsTable.module.scss';

type SpecsTableProps = {
  product: Pick<Product, 'brand' | 'name' | 'description' | 'specs'>;
};

type SpecRow = { label: string; value: string; lang?: 'es' };

/** "SPECIFICATIONS": a semantic table, one row header per spec. */
export function SpecsTable({ product }: SpecsTableProps) {
  const titleId = useId();
  const { specs } = product;

  const rows: SpecRow[] = [
    { label: 'BRAND', value: product.brand },
    { label: 'NAME', value: product.name },
    // The API descriptions are in Spanish, the document is in English.
    { label: 'DESCRIPTION', value: product.description, lang: 'es' },
    { label: 'SCREEN', value: specs.screen },
    { label: 'RESOLUTION', value: specs.resolution },
    { label: 'PROCESSOR', value: specs.processor },
    { label: 'MAIN CAMERA', value: specs.mainCamera },
    { label: 'SELFIE CAMERA', value: specs.selfieCamera },
    { label: 'BATTERY', value: specs.battery },
    { label: 'OS', value: specs.os },
    { label: 'SCREEN REFRESH RATE', value: specs.screenRefreshRate },
  ];

  return (
    <section className={styles.specs} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        SPECIFICATIONS
      </h2>
      <table className={styles.table} aria-labelledby={titleId}>
        <tbody>
          {rows.map(({ label, value, lang }) => (
            <tr key={label} className={styles.row}>
              <th scope="row" className={styles.label}>
                {label}
              </th>
              <td className={styles.value} lang={lang}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
