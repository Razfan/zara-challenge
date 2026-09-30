import 'server-only';
import { apiFetch } from './api';
import type { Product, ProductListItem } from './types';

const LIST_SIZE = 20;
// The API can return the same product twice, so ask for a few extra before trimming.
const FETCH_SIZE = 30;

const toHttps = (url: string) => url.replace(/^http:\/\//, 'https://');

function toListItems(items: ProductListItem[]): ProductListItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => ({ ...item, imageUrl: toHttps(item.imageUrl) }));
}

export async function getProducts(search?: string): Promise<ProductListItem[]> {
  const term = search?.trim();
  const query = term ? `search=${encodeURIComponent(term)}` : `limit=${FETCH_SIZE}`;
  const products = await apiFetch<ProductListItem[]>(`/products?${query}`);
  const items = toListItems(products ?? []);
  return term ? items : items.slice(0, LIST_SIZE);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
  if (!product) return null;

  return {
    ...product,
    // basePrice doesn't always match the cheapest storage option, which is what the UI shows as "From".
    basePrice: Math.min(...product.storageOptions.map((option) => option.price)),
    colorOptions: product.colorOptions.map((color) => ({
      ...color,
      imageUrl: toHttps(color.imageUrl),
    })),
    similarProducts: toListItems(product.similarProducts.filter((item) => item.id !== id)),
  };
}
