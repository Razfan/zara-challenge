import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CartContext, CartProvider } from '@/context/CartContext';
import type { Cart, CartItem } from '@/context/CartContext';
import CartPage from './page';

const galaxyLine: CartItem = {
  lineId: 'line-1',
  productId: 'SMG-S24U',
  name: 'Galaxy S24 Ultra',
  brand: 'Samsung',
  imageUrl: 'https://example.com/galaxy-violet.png',
  color: { name: 'Titanium Violet', hexCode: '#8E6F96' },
  storage: { capacity: '512 GB', price: 1329 },
};
const redmiLine: CartItem = {
  lineId: 'line-2',
  productId: 'XIA-RN13',
  name: 'Redmi Note 13',
  brand: 'Xiaomi',
  imageUrl: 'https://example.com/redmi-blue.png',
  color: { name: 'Ocean Blue', hexCode: '#2a4d69' },
  storage: { capacity: '128 GB', price: 399 },
};
const galaxyName = 'Galaxy S24 Ultra 512 GB Titanium Violet';
const redmiName = 'Redmi Note 13 128 GB Ocean Blue';

const renderCart = async (items: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(items));
  const view = render(
    <CartProvider>
      <CartPage />
    </CartProvider>,
  );
  // The provider loads the stored cart after mounting.
  await screen.findByRole('heading', { level: 1, name: `CART (${items.length})` });
  return view;
};

const removeButton = (name: string) => screen.getByRole('button', { name: `Eliminar ${name}` });
// Distinct from CartSummary's own `role="status"` message.
const announcer = () => screen.getByTestId('cart-announcer');

/** No Web Animations API in jsdom by default: `getAnimations` runs the fade out synchronously
 * unless a test opts into a controllable one with `mockRunningAnimation`. */
function mockRunningAnimation() {
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => (resolveFinished = resolve));
  Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
    configurable: true,
    value: () => [{ finished }],
  });
  return {
    finish: () => act(async () => resolveFinished()),
    restore: () => delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations,
  };
}

describe('CartPage', () => {
  beforeEach(() => localStorage.clear());

  it('titles the view "CART (<n>)" with the number of lines', async () => {
    await renderCart([galaxyLine, redmiLine]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CART (2)');
  });

  it('lists every line', async () => {
    await renderCart([galaxyLine, redmiLine]);

    const lines = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent('Galaxy S24 Ultra');
    expect(lines[1]).toHaveTextContent('Redmi Note 13');
  });

  it('shows the total of every line', async () => {
    await renderCart([galaxyLine, redmiLine]);

    expect(screen.getByText('1728 EUR')).toBeInTheDocument();
  });

  it('removing a line updates the title and the total', async () => {
    await renderCart([galaxyLine, redmiLine]);

    await userEvent.click(removeButton(galaxyName));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CART (1)');
    expect(
      screen.queryByRole('button', { name: `Eliminar ${galaxyName}` }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('399 EUR', { selector: 'span' })).toBeInTheDocument();
  });

  describe('with animations', () => {
    let animation: ReturnType<typeof mockRunningAnimation>;
    beforeEach(() => (animation = mockRunningAnimation()));
    afterEach(() => animation.restore());

    it('fades the line out before removing it and moves focus to the next line', async () => {
      await renderCart([galaxyLine, redmiLine]);

      await userEvent.click(removeButton(galaxyName));

      const [galaxy] = within(screen.getByRole('list')).getAllByRole('listitem');
      expect(galaxy).toHaveAttribute('data-leaving', 'true');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CART (2)');

      await animation.finish();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CART (1)');
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
      expect(removeButton(redmiName)).toHaveFocus();
    });

    it('ignores further presses while the line fades out', async () => {
      await renderCart([galaxyLine, redmiLine]);

      await userEvent.click(removeButton(galaxyName));
      await userEvent.click(removeButton(galaxyName));
      await animation.finish();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CART (1)');
    });
  });

  it('moves the focus to the previous line after removing the last one', async () => {
    await renderCart([galaxyLine, redmiLine]);

    await userEvent.click(removeButton(redmiName));

    expect(removeButton(galaxyName)).toHaveFocus();
  });

  it('moves the focus to the title when the cart becomes empty', async () => {
    await renderCart([galaxyLine]);

    await userEvent.click(removeButton(galaxyName));

    expect(screen.getByRole('heading', { level: 1, name: 'CART (0)' })).toHaveFocus();
  });

  it('announces the removed line, varying the text on repeated removals', async () => {
    await renderCart([galaxyLine, { ...galaxyLine, lineId: 'line-3' }]);
    expect(announcer()).toBeEmptyDOMElement();

    await userEvent.click(screen.getAllByRole('button', { name: `Eliminar ${galaxyName}` })[0]);
    const first = announcer().textContent;
    await userEvent.click(removeButton(galaxyName));
    const second = announcer().textContent;

    expect(announcer()).toHaveTextContent('Galaxy S24 Ultra removed from cart');
    expect(second).not.toBe(first);
  });

  it('shows only the title until the persisted cart is loaded, never an empty cart', () => {
    const loading: Cart = {
      items: [],
      count: 0,
      total: 0,
      hydrated: false,
      add: jest.fn(),
      remove: jest.fn(),
    };
    render(
      <CartContext.Provider value={loading}>
        <CartPage />
      </CartContext.Provider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^CART$/);
    expect(screen.queryByRole('link', { name: 'CONTINUE SHOPPING' })).not.toBeInTheDocument();
  });

  it('an empty cart shows only the title and CONTINUE SHOPPING', async () => {
    await renderCart([]);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'PAY' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CONTINUE SHOPPING' })).toBeInTheDocument();
  });

  it.each([
    ['with lines', [galaxyLine, redmiLine]],
    ['empty', []],
  ])('has no accessibility violations %s', async (_, items) => {
    const { container } = await renderCart(items);

    expect(await axe(container)).toHaveNoViolations();
  });
});
