import { render, screen } from '@testing-library/react';
import { AnimatedText } from './AnimatedText';

const changedChars = () =>
  screen
    .queryAllByText((_, element) => element?.hasAttribute('data-previous') ?? false)
    .map((element) => [element.getAttribute('data-previous'), element.textContent]);

describe('AnimatedText', () => {
  it('renders the value as plain text, without animating the first render', () => {
    render(<AnimatedText value="From 1229 EUR" />);

    expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();
    expect(changedChars()).toEqual([]);
  });

  it('animates only the characters that change', () => {
    const { container, rerender } = render(<AnimatedText value="1199 EUR" />);

    rerender(<AnimatedText value="1599 EUR" />);

    expect(changedChars()).toEqual([['1', '5']]);
    expect(container).toHaveTextContent(/^1599 EUR$/);
  });

  it('keeps the previous characters out of the text content', () => {
    const { container, rerender } = render(<AnimatedText value="From 1229 EUR" />);

    rerender(<AnimatedText value="1529 EUR" />);

    expect(container).toHaveTextContent(/^1529 EUR$/);
    expect(changedChars()).toEqual([['2', '5']]);
  });

  it('animates a full text change, such as the selected color name', () => {
    const { rerender } = render(<AnimatedText value="Titanium Violet" />);

    rerender(<AnimatedText value="Titanium Black" />);

    expect(changedChars().length).toBeGreaterThan(0);
  });
});
