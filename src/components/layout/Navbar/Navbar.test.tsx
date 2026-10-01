import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from './Navbar';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

const mockUsePathname = jest.mocked(usePathname);

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    localStorage.clear();
  });

  it('shows the logo as a link to /', () => {
    render(<Navbar />, { wrapper: CartProvider });

    const banner = screen.getByRole('banner');
    expect(within(banner).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  it('links to /cart with the number of cart lines', () => {
    render(<Navbar />, { wrapper: CartProvider });

    const cartLink = screen.getByRole('link', { name: 'Cart, 0 items' });
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(cartLink).toHaveTextContent('0');
    expect(cartLink).toHaveAttribute('data-filled', 'false');
  });

  it('shows the persisted number of lines as filled after hydrating', async () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          lineId: 'line-1',
          productId: 'SMG-S24U',
          name: 'Galaxy S24 Ultra',
          brand: 'Samsung',
          imageUrl: 'https://example.com/galaxy.png',
          color: { name: 'Black', hexCode: '#000' },
          storage: { capacity: '256GB', price: 1329 },
        },
      ]),
    );

    render(<Navbar />, { wrapper: CartProvider });

    const link = await screen.findByRole('link', { name: 'Cart, 1 item' });
    expect(link).toHaveAttribute('data-filled', 'true');
  });

  it('hides the cart link on /cart', () => {
    mockUsePathname.mockReturnValue('/cart');
    render(<Navbar />, { wrapper: CartProvider });

    expect(screen.queryByRole('link', { name: /cart/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
