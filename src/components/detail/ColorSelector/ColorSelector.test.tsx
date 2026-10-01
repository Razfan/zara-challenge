import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import type { ColorOption } from '@/lib/types';
import { ColorSelector } from './ColorSelector';

const options: ColorOption[] = [
  { name: 'Titanium Violet', hexCode: '#8E6F96', imageUrl: 'https://example.com/violet.webp' },
  { name: 'Titanium Black', hexCode: '#000000', imageUrl: 'https://example.com/black.webp' },
];

/** Controlled like in ProductConfigurator. */
function Harness() {
  const [selected, setSelected] = useState<ColorOption>();
  return <ColorSelector options={options} selected={selected} onSelect={setSelected} />;
}

const LABEL = 'Color. pick your favourite.';

// While a character animates, the name is split into several text nodes (AnimatedText).
const nameText = (text: string) => (_: string, element: Element | null) =>
  element?.tagName === 'P' && element.textContent === text;

describe('ColorSelector', () => {
  it('presents the colors as a labelled radio group named by each color', () => {
    render(<Harness />);

    const group = screen.getByRole('group', { name: LABEL });
    expect(within(group).getAllByRole('radio')).toHaveLength(2);
    for (const { name } of options) {
      expect(within(group).getByRole('radio', { name })).toBeInTheDocument();
    }
  });

  it('paints each swatch with its color', () => {
    render(<Harness />);

    expect(screen.getByTestId('swatch-Titanium Violet')).toHaveStyle({
      backgroundColor: '#8E6F96',
    });
  });

  it('does not preselect any color', () => {
    render(<Harness />);

    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    expect(screen.queryByText('Titanium Violet', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('reports the selected color and shows its name under the selector', async () => {
    const onSelect = jest.fn();
    const { rerender } = render(
      <ColorSelector options={options} selected={undefined} onSelect={onSelect} />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Titanium Black' }));
    expect(onSelect).toHaveBeenCalledWith(options[1]);

    rerender(<ColorSelector options={options} selected={options[1]} onSelect={onSelect} />);
    expect(screen.getByText('Titanium Black', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Titanium Black' })).toBeChecked();
  });

  it('animates the characters that change when the selected color name changes', () => {
    const { rerender } = render(
      <ColorSelector options={options} selected={options[0]} onSelect={jest.fn()} />,
    );

    rerender(<ColorSelector options={options} selected={options[1]} onSelect={jest.fn()} />);

    const changed = screen.queryAllByText(
      (_, element) => element?.hasAttribute('data-previous') ?? false,
    );
    expect(changed.length).toBeGreaterThan(0);
    expect(screen.getByText(nameText('Titanium Black'))).toBeInTheDocument();
  });

  it('is keyboard navigable with Tab and arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Titanium Violet' })).toHaveFocus();

    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Titanium Violet' })).toBeChecked();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Titanium Black' })).toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Titanium Black' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
