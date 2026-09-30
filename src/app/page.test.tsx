import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { NavigationProgressProvider } from '@/context/NavigationProgressContext';
import { getProducts } from '@/lib/products';
import type { ProductListItem } from '@/lib/types';
import HomePage from './page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/lib/products', () => ({ getProducts: jest.fn() }));
jest
  .mocked(useRouter)
  .mockReturnValue({ replace: jest.fn() } as unknown as ReturnType<typeof useRouter>);

const getProductsMock = jest.mocked(getProducts);

const galaxy: ProductListItem = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1329,
  imageUrl: 'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U.webp',
};

const renderPage = async (searchParams: Record<string, string | string[] | undefined>) =>
  render(await HomePage({ searchParams: Promise.resolve(searchParams) }), {
    wrapper: NavigationProgressProvider,
  });

describe('HomePage (app/page.tsx)', () => {
  beforeEach(() => getProductsMock.mockResolvedValue([galaxy]));

  it('renders the products without a search when the URL has none', async () => {
    await renderPage({});

    expect(getProductsMock).toHaveBeenCalledWith('');
    expect(
      screen.getByRole('link', { name: 'Samsung Galaxy S24 Ultra, 1329 EUR' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('renders on the server the results of /?search=<term> with the field prefilled', async () => {
    await renderPage({ search: 'samsung' });

    expect(getProductsMock).toHaveBeenCalledWith('samsung');
    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
    expect(screen.getByText('1 RESULTS')).toBeInTheDocument();
  });

  it('uses the first value when the search param is repeated', async () => {
    await renderPage({ search: ['samsung', 'apple'] });

    expect(getProductsMock).toHaveBeenCalledWith('samsung');
  });
});
