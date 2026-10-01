import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import type { ColorOption, Product, StorageOption } from '@/lib/types';
import { AddToCartButton } from './AddToCartButton';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
const push = jest.fn();
jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);

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
  storageOptions: [{ capacity: '512 GB', price: 1329 }],
  similarProducts: [],
};
const [violet] = product.colorOptions;
const storage512 = product.storageOptions[0];

/** Exposes the cart lines to assert on them, without the random lineId. */
function CartProbe() {
  const { items } = useCart();
  const lines = items.map(({ productId, name, brand, imageUrl, color, storage }) => ({
    productId,
    name,
    brand,
    imageUrl,
    color,
    storage,
  }));
  return <pre data-testid="cart">{JSON.stringify(lines)}</pre>;
}

const renderButton = (storage?: StorageOption, color?: ColorOption) =>
  render(
    <CartProvider>
      <AddToCartButton product={product} storage={storage} color={color} />
      <CartProbe />
    </CartProvider>,
  );

const button = () => screen.getByRole('button', { name: 'AÑADIR' });
const cartLines = () => JSON.parse(screen.getByTestId('cart').textContent ?? '[]') as unknown[];

describe('AddToCartButton', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ['nothing is selected', undefined, undefined],
    ['only the storage is selected', storage512, undefined],
    ['only the color is selected', undefined, violet],
  ])('is aria-disabled, still focusable and says what is missing while %s', async (_, s, c) => {
    renderButton(s, c);

    expect(button()).toHaveAttribute('aria-disabled', 'true');
    expect(button()).toBeEnabled();
    expect(button()).toHaveAccessibleDescription('Select storage and color');

    await userEvent.tab();
    expect(button()).toHaveFocus();
  });

  it('does not add anything when pressed while disabled', async () => {
    renderButton(storage512, undefined);

    await userEvent.click(button());

    expect(cartLines()).toEqual([]);
  });

  it('is enabled without the hint once storage and color are selected', () => {
    renderButton(storage512, violet);

    expect(button()).toHaveAttribute('aria-disabled', 'false');
    expect(button()).not.toHaveAccessibleDescription();
  });

  it('adds a line with product, color, storage and color image, then goes to the cart', async () => {
    renderButton(storage512, violet);

    await userEvent.click(button());

    expect(cartLines()).toEqual([
      {
        productId: 'SMG-S24U',
        name: 'Galaxy S24 Ultra',
        brand: 'Samsung',
        imageUrl: violet.imageUrl,
        color: { name: 'Titanium Violet', hexCode: '#8E6F96' },
        storage: { capacity: '512 GB', price: 1329 },
      },
    ]);
    expect(push).toHaveBeenCalledWith('/cart');
  });

  it('adds an independent line on every press', async () => {
    renderButton(storage512, violet);

    await userEvent.click(button());
    await userEvent.click(button());

    expect(cartLines()).toHaveLength(2);
  });

  it('marks "AÑADIR" as Spanish', () => {
    renderButton();

    expect(screen.getByText('AÑADIR')).toHaveAttribute('lang', 'es');
  });

  it.each([
    ['disabled', undefined, undefined],
    ['enabled', storage512, violet],
  ])('has no accessibility violations while %s', async (_, s, c) => {
    const { container } = renderButton(s, c);

    expect(await axe(container)).toHaveNoViolations();
  });
});
