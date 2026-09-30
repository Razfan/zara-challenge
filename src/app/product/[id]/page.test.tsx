import { render, screen } from '@testing-library/react';
import { notFound, useRouter } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { getProductById } from '@/lib/products';
import type { Product } from '@/lib/types';
import ProductPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/lib/products', () => ({ getProductById: jest.fn() }));
jest
  .mocked(useRouter)
  .mockReturnValue({ push: jest.fn() } as unknown as ReturnType<typeof useRouter>);

const getProductByIdMock = jest.mocked(getProductById);

const product: Product = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  description: 'Un movil',
  basePrice: 1229,
  rating: 4.5,
  specs: {
    screen: '6.8"',
    resolution: '3120 x 1440',
    processor: 'Snapdragon',
    mainCamera: '200 Mpx',
    selfieCamera: '12 Mpx',
    battery: '5000 mAh',
    os: 'Android 14',
    screenRefreshRate: '120 Hz',
  },
  colorOptions: [
    { name: 'Titanium Violet', hexCode: '#8E6F96', imageUrl: 'https://example.com/violet.webp' },
  ],
  storageOptions: [{ capacity: '256 GB', price: 1229 }],
  similarProducts: [
    {
      id: 'XIA-RN13',
      brand: 'Xiaomi',
      name: 'Redmi Note 13',
      basePrice: 399,
      imageUrl: 'https://example.com/redmi.webp',
    },
  ],
};

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('ProductPage (app/product/[id]/page.tsx)', () => {
  it('renders the product: heading, specs and similar items', async () => {
    getProductByIdMock.mockResolvedValue(product);

    render(await ProductPage(params('SMG-S24U')), { wrapper: CartProvider });

    expect(getProductByIdMock).toHaveBeenCalledWith('SMG-S24U');
    expect(screen.getByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xiaomi Redmi Note 13, 399 EUR' })).toBeInTheDocument();
  });

  it('renders the app 404 when the product does not exist', async () => {
    getProductByIdMock.mockResolvedValue(null);

    await expect(ProductPage(params('UNKNOWN'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
