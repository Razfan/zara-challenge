import { act, renderHook, waitFor } from '@testing-library/react';
import { cartReducer, CartProvider, useCart, type CartItem, type CartState } from './CartContext';

const galaxyLine: CartItem = {
  lineId: 'line-1',
  productId: 'SMG-S24U',
  name: 'Galaxy S24 Ultra',
  brand: 'Samsung',
  imageUrl: 'https://example.com/galaxy-black.png',
  color: { name: 'Titanium Black', hexCode: '#1b1a18' },
  storage: { capacity: '256GB', price: 1329 },
};

const redmiLine: CartItem = {
  lineId: 'line-2',
  productId: 'XIA-RN13',
  name: 'Redmi Note 13',
  brand: 'Xiaomi',
  imageUrl: 'https://example.com/redmi-blue.png',
  color: { name: 'Ocean Blue', hexCode: '#2a4d69' },
  storage: { capacity: '128GB', price: 399 },
};

const galaxyConfig = {
  productId: galaxyLine.productId,
  name: galaxyLine.name,
  brand: galaxyLine.brand,
  imageUrl: galaxyLine.imageUrl,
  color: galaxyLine.color,
  storage: galaxyLine.storage,
};

describe('cartReducer', () => {
  it('adds an item', () => {
    const state = cartReducer({ items: [], hydrated: true }, { type: 'ADD', item: galaxyLine });

    expect(state.items).toEqual([galaxyLine]);
  });

  it('adds every "add" as an independent line, even for the same configuration', () => {
    const duplicate = { ...galaxyLine, lineId: 'line-3' };
    const state = [galaxyLine, duplicate].reduce<CartState>(
      (current, item) => cartReducer(current, { type: 'ADD', item }),
      { items: [], hydrated: true },
    );

    expect(state.items).toEqual([galaxyLine, duplicate]);
  });

  it('removes only the line with the given lineId', () => {
    const state = { items: [galaxyLine, redmiLine], hydrated: true };

    const next = cartReducer(state, { type: 'REMOVE', lineId: galaxyLine.lineId });

    expect(next.items).toEqual([redmiLine]);
  });

  it('keeps the same items when the lineId does not exist', () => {
    const state = { items: [galaxyLine], hydrated: true };

    expect(cartReducer(state, { type: 'REMOVE', lineId: 'missing' }).items).toEqual([galaxyLine]);
  });

  it('replaces the items and marks the cart as hydrated', () => {
    const next = cartReducer(
      { items: [], hydrated: false },
      { type: 'HYDRATE', items: [redmiLine] },
    );

    expect(next).toEqual({ items: [redmiLine], hydrated: true });
  });
});

describe('CartProvider', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty and restores the persisted cart after mounting', async () => {
    localStorage.setItem('cart', JSON.stringify([galaxyLine, redmiLine]));

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    await waitFor(() => expect(result.current.items).toEqual([galaxyLine, redmiLine]));
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(1329 + 399);
  });

  it('adds a line with a generated lineId and persists it', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cart') ?? 'null')).toEqual([]));

    act(() => result.current.add(galaxyConfig));

    await waitFor(() => expect(result.current.count).toBe(1));
    expect(result.current.items[0]).toEqual({ ...galaxyConfig, lineId: expect.any(String) });
    expect(JSON.parse(localStorage.getItem('cart') ?? 'null')).toEqual(result.current.items);
  });

  it('removes a line and persists the change', async () => {
    localStorage.setItem('cart', JSON.stringify([galaxyLine, redmiLine]));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.remove(galaxyLine.lineId));

    expect(result.current.items).toEqual([redmiLine]);
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('cart') ?? 'null')).toEqual([redmiLine]),
    );
  });

  it('does not overwrite the persisted cart with the empty initial state on mount', async () => {
    const stored = JSON.stringify([galaxyLine]);
    localStorage.setItem('cart', stored);

    renderHook(() => useCart(), { wrapper: CartProvider });

    await waitFor(() => expect(localStorage.getItem('cart')).toEqual(stored));
  });

  it('keeps working in memory when localStorage throws', async () => {
    jest.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.add(galaxyConfig));

    await waitFor(() => expect(result.current.count).toBe(1));
    jest.restoreAllMocks();
  });

  it('throws when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within CartProvider');

    consoleError.mockRestore();
  });
});
