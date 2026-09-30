import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { CartItem as CartLine } from '@/context/CartContext';
import { CartItem } from './CartItem';

const galaxyLine: CartLine = {
  lineId: 'line-1',
  productId: 'SMG-S24U',
  name: 'Galaxy S24 Ultra',
  brand: 'Samsung',
  imageUrl: 'https://example.com/galaxy-violet.png',
  color: { name: 'Titanium Violet', hexCode: '#8E6F96' },
  storage: { capacity: '512 GB', price: 1329 },
};

const renderItem = (onRemove = jest.fn(), leaving = false) =>
  render(
    <ul>
      <CartItem item={galaxyLine} onRemove={onRemove} leaving={leaving} />
    </ul>,
  );

const removeButton = () =>
  screen.getByRole('button', { name: 'Eliminar Galaxy S24 Ultra 512 GB Titanium Violet' });

describe('CartItem', () => {
  it('shows the image of the chosen color', () => {
    renderItem();

    const image = within(screen.getByRole('listitem')).getByRole('presentation');
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent('https://example.com/galaxy-violet.png')),
    );
  });

  it('shows the name, "<capacity> | <color>" and the line price', () => {
    renderItem();
    const line = within(screen.getByRole('listitem'));

    expect(line.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(line.getByText('512 GB | Titanium Violet')).toBeInTheDocument();
    expect(line.getByText('1329 EUR')).toBeInTheDocument();
  });

  it('names the "Eliminar" button after the product, storage and color', () => {
    renderItem();

    expect(removeButton()).toHaveTextContent('Eliminar');
    expect(removeButton()).toHaveAttribute('lang', 'es');
  });

  it('asks to remove only its own line', async () => {
    const onRemove = jest.fn();
    renderItem(onRemove);

    await userEvent.click(removeButton());

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(galaxyLine);
  });

  it('ignores presses while already leaving', async () => {
    const onRemove = jest.fn();
    renderItem(onRemove, true);

    await userEvent.click(removeButton());

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderItem();

    expect(await axe(container)).toHaveNoViolations();
  });
});
