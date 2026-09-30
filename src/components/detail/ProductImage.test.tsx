import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductImage } from './ProductImage';

const violet = 'https://example.com/violet.webp';
const yellow = 'https://example.com/yellow.webp';
const black = 'https://example.com/black.webp';

const findImage = (container: HTMLElement, src: string) =>
  [...container.querySelectorAll('img')].find((img) =>
    img.getAttribute('src')?.includes(encodeURIComponent(src)),
  );

describe('ProductImage', () => {
  it('shows the first image straight away, without a load event', () => {
    render(<ProductImage src={violet} alt="Violet" />);

    expect(screen.getByRole('img')).toHaveAttribute('data-visible', 'true');
  });

  it('cross-fades from the previous image once the new one loads', async () => {
    const { rerender } = render(<ProductImage src={violet} alt="Violet" />);

    rerender(<ProductImage src={yellow} alt="Yellow" />);

    // The previous image is decorative (alt=""), so only the new one is an img.
    const previous = screen.getByRole('presentation');
    const current = screen.getByRole('img');
    expect(previous).toHaveAttribute('data-visible', 'true');
    expect(current).toHaveAttribute('data-visible', 'false');

    fireEvent.load(current);

    // next/image resolves onLoad through img.decode(), a microtask.
    await waitFor(() => expect(current).toHaveAttribute('data-visible', 'true'));
    expect(previous).toHaveAttribute('data-visible', 'false');
  });

  it('shows again an image already loaded when going back to it', async () => {
    const { rerender } = render(<ProductImage src={violet} alt="Violet" />);

    rerender(<ProductImage src={yellow} alt="Yellow" />);
    fireEvent.load(screen.getByRole('img'));
    await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('data-visible', 'true'));

    // Back to the first color: the same, already loaded element fires no new load event.
    rerender(<ProductImage src={violet} alt="Violet" />);

    expect(screen.getByRole('img')).toHaveAccessibleName('Violet');
    expect(screen.getByRole('img')).toHaveAttribute('data-visible', 'true');
  });

  it('keeps the last loaded image underneath when changing again before loading', () => {
    const { container, rerender } = render(<ProductImage src={violet} alt="Violet" />);

    rerender(<ProductImage src={yellow} alt="Yellow" />);
    rerender(<ProductImage src={black} alt="Black" />);

    // Yellow never loaded: violet stays visible until black has loaded.
    expect(screen.getByRole('img')).toHaveAttribute('data-visible', 'false');
    expect(findImage(container, violet)).toHaveAttribute('data-visible', 'true');
    expect(findImage(container, yellow)).toHaveAttribute('data-visible', 'false');
  });

  it('never reorders the images in the DOM, so the cross-fade also runs when going back', async () => {
    const { rerender } = render(<ProductImage src={violet} alt="Violet" />);
    rerender(<ProductImage src={yellow} alt="Yellow" />);
    const insertions = jest.spyOn(Node.prototype, 'insertBefore');

    rerender(<ProductImage src={violet} alt="Violet" />);

    expect(insertions).not.toHaveBeenCalled();
    insertions.mockRestore();
    await waitFor(() => expect(screen.getByRole('img')).toHaveAccessibleName('Violet'));
  });
});
