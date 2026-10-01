import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import type { ProductListItem } from '@/lib/types';
import { ProductCard } from './ProductCard';

const product: ProductListItem = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1229,
  imageUrl: 'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U.webp',
};

describe('ProductCard', () => {
  it('links to the product detail page', () => {
    render(
      <ul>
        <ProductCard product={product} />
      </ul>,
    );

    const link = screen.getByRole('link', { name: 'Samsung Galaxy S24 Ultra, 1229 EUR' });
    expect(link).toHaveAttribute('href', '/product/SMG-S24U');
  });

  it('shows the brand, name and price', () => {
    render(
      <ul>
        <ProductCard product={product} />
      </ul>,
    );

    expect(screen.getByText('Samsung')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(screen.getByText('1229 EUR')).toBeInTheDocument();
  });

  it('uses a decorative image, since the link name already describes the product', () => {
    render(
      <ul>
        <ProductCard product={product} />
      </ul>,
    );

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('loads the image eagerly only when marked as priority', () => {
    const { rerender } = render(
      <ul>
        <ProductCard product={product} />
      </ul>,
    );
    expect(screen.getByRole('presentation')).toHaveAttribute('loading', 'lazy');

    rerender(
      <ul>
        <ProductCard product={product} priority />
      </ul>,
    );
    expect(screen.getByRole('presentation')).not.toHaveAttribute('loading');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ul>
        <ProductCard product={product} />
      </ul>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
