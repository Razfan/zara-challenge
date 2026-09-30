import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import type { ProductListItem } from '@/lib/types';
import { ProductGrid } from './ProductGrid';

const makeProducts = (count: number): ProductListItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `ID-${index}`,
    brand: 'Brand',
    name: `Phone ${index}`,
    basePrice: 100 + index,
    imageUrl: `https://prueba-tecnica-api-tienda-moviles.onrender.com/images/ID-${index}.webp`,
  }));

describe('ProductGrid', () => {
  it('renders the products as a semantic list, one item per product', () => {
    render(<ProductGrid products={makeProducts(3)} />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(
      within(items[0]).getByRole('link', { name: 'Brand Phone 0, 100 EUR' }),
    ).toBeInTheDocument();
  });

  it('loads the first 10 images (two desktop rows) with priority and the rest lazily', () => {
    render(<ProductGrid products={makeProducts(12)} />);

    const images = screen.getAllByRole('presentation');
    expect(images).toHaveLength(12);
    images.slice(0, 10).forEach((image) => expect(image).not.toHaveAttribute('loading'));
    images.slice(10).forEach((image) => expect(image).toHaveAttribute('loading', 'lazy'));
  });

  it('renders an empty list without errors when there are no products', () => {
    render(<ProductGrid products={[]} />);

    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProductGrid products={makeProducts(2)} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
