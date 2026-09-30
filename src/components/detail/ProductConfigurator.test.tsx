import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useRouter } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import type { Product } from '@/lib/types';
import { ProductConfigurator } from './ProductConfigurator';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest
  .mocked(useRouter)
  .mockReturnValue({ push: jest.fn() } as unknown as ReturnType<typeof useRouter>);

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
    { name: 'Titanium Black', hexCode: '#000000', imageUrl: 'https://example.com/black.webp' },
  ],
  storageOptions: [
    { capacity: '256 GB', price: 1229 },
    { capacity: '1 TB', price: 1529 },
  ],
  similarProducts: [],
};

const renderConfigurator = () =>
  render(<ProductConfigurator product={product} />, { wrapper: CartProvider });

describe('ProductConfigurator', () => {
  it('shows the device name as the main heading', () => {
    renderConfigurator();

    expect(screen.getByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' })).toBeInTheDocument();
  });

  it('shows "From <base price>" while no storage is selected, then the selected price', async () => {
    renderConfigurator();

    expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: '1 TB' }));

    expect(screen.getByText('1529 EUR')).toBeInTheDocument();
    expect(screen.queryByText(/From/)).not.toBeInTheDocument();
  });

  it('shows the image of the first color until another is selected', async () => {
    renderConfigurator();

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Samsung Galaxy S24 Ultra, Titanium Violet',
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Titanium Black' }));

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Samsung Galaxy S24 Ultra, Titanium Black',
    );
  });

  it('starts without any storage or color selected and enables "AÑADIR" once both are picked', async () => {
    renderConfigurator();
    const addButton = screen.getByRole('button', { name: 'AÑADIR' });
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    expect(addButton).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(screen.getByRole('radio', { name: '1 TB' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Titanium Black' }));

    expect(addButton).toHaveAttribute('aria-disabled', 'false');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderConfigurator();

    expect(await axe(container)).toHaveNoViolations();
  });
});
