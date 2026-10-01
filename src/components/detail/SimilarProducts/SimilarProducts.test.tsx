import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ProductCard } from '@/components/product/ProductCard';
import type { ProductListItem } from '@/lib/types';
import { SimilarProducts } from './SimilarProducts';

const makeProducts = (count: number): ProductListItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `ID-${index}`,
    brand: 'Brand',
    name: `Phone ${index}`,
    basePrice: 100 + index,
    imageUrl: `https://prueba-tecnica-api-tienda-moviles.onrender.com/images/ID-${index}.webp`,
  }));

const renderSimilar = (products = makeProducts(6)) =>
  render(
    <SimilarProducts>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimilarProducts>,
  );

const carousel = () => screen.getByRole('region', { name: 'SIMILAR ITEMS' });

/** jsdom has no layout: fakes a 2000px wide list inside a 1000px viewport. */
const fakeOverflow = (element: HTMLElement) => {
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: 2000 });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: 1000 });
};

// jsdom has no PointerEvent: without it fireEvent drops clientX and buttons.
class FakePointerEvent extends MouseEvent {
  readonly pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

describe('SimilarProducts', () => {
  beforeAll(() => {
    window.PointerEvent ??= FakePointerEvent as unknown as typeof PointerEvent;
  });

  it('shows a "SIMILAR ITEMS" section with the list product cards', () => {
    const products = makeProducts(3);
    renderSimilar(products);

    expect(screen.getByRole('heading', { level: 2, name: 'SIMILAR ITEMS' })).toBeInTheDocument();
    const cards = within(carousel()).getAllByRole('link');
    expect(cards).toHaveLength(products.length);
    expect(
      within(carousel()).getByRole('link', { name: 'Brand Phone 0, 100 EUR' }),
    ).toHaveAttribute('href', '/product/ID-0');
  });

  it('renders nothing without similar products', () => {
    const { container } = render(<SimilarProducts>{null}</SimilarProducts>);

    expect(container).toBeEmptyDOMElement();
  });

  it('is a focusable region, so the keyboard can scroll it', async () => {
    renderSimilar();

    await userEvent.tab();

    expect(carousel()).toHaveFocus();
  });

  it('moves the 1px progress bar as the carousel scrolls', () => {
    renderSimilar();
    const progressBar = screen.getByTestId('scroll-progress');
    expect(progressBar.style.getPropertyValue('--scroll-progress')).toBe('0');

    fakeOverflow(carousel());
    carousel().scrollLeft = 500;
    fireEvent.scroll(carousel());

    expect(progressBar.style.getPropertyValue('--scroll-progress')).toBe('0.5');
  });

  describe('with the mouse on the progress bar (100px-500px track, 150px thumb)', () => {
    const setUpBar = () => {
      renderSimilar();
      const progressBar = screen.getByTestId('scroll-progress');
      const thumb = screen.getByTestId('scroll-thumb');
      fakeOverflow(carousel());
      carousel().scrollTo = jest.fn();
      jest
        .spyOn(progressBar, 'getBoundingClientRect')
        .mockReturnValue({ left: 100, width: 400 } as DOMRect);
      Object.defineProperty(thumb, 'offsetWidth', { configurable: true, value: 150 });
      return { progressBar, thumb };
    };

    it('pressing the track scrolls smoothly so the thumb centers on the pointer', () => {
      const { progressBar } = setUpBar();

      // Thumb center at 300px: (300 - 100 - 75) / (400 - 150) = 50% of the 1000px overflow.
      fireEvent.pointerDown(progressBar, { clientX: 300, button: 0 });

      expect(carousel().scrollTo).toHaveBeenCalledWith({ left: 500, behavior: 'smooth' });
    });

    it('dragging the thumb follows the pointer from where it was grabbed, without jumps', () => {
      const { progressBar, thumb } = setUpBar();

      fireEvent.pointerDown(thumb, { clientX: 150, button: 0 });
      expect(carousel().scrollLeft).toBe(0);
      expect(carousel()).toHaveAttribute('data-dragging', 'true');

      // 125px of the 250px thumb travel = half of the 1000px overflow.
      fireEvent.pointerMove(progressBar, { clientX: 275 });
      expect(carousel().scrollLeft).toBe(500);

      fireEvent.pointerUp(progressBar);
      expect(carousel()).not.toHaveAttribute('data-dragging');

      fireEvent.pointerMove(progressBar, { clientX: 400 });
      expect(carousel().scrollLeft).toBe(500);
    });
  });

  it('hides the decorative progress bar from assistive technologies', () => {
    renderSimilar();

    expect(screen.getByTestId('scroll-progress')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderSimilar(makeProducts(2));

    expect(await axe(container)).toHaveNoViolations();
  });
});
