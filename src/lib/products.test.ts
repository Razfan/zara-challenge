/**
 * @jest-environment node
 */
import { getProductById, getProducts } from './products';
import productsFixture from './__fixtures__/products.json';
import galaxyFixture from './__fixtures__/product-SMG-S24U.json';
import redmiFixture from './__fixtures__/product-XIA-RN13.json';

jest.mock('server-only', () => ({}));

const fetchMock = jest.spyOn(global, 'fetch');

function mockResponse(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
}

function requestedUrl() {
  return String(fetchMock.mock.calls[0][0]);
}

describe('getProducts', () => {
  it('sends the API key and caches the response for an hour', async () => {
    process.env.API_KEY = 'test-key';
    mockResponse(productsFixture);

    await getProducts();

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      headers: { 'x-api-key': 'test-key' },
      next: { revalidate: 3600 },
    });
  });

  it('removes duplicated products and returns the first 20', async () => {
    mockResponse(productsFixture);

    const products = await getProducts();

    expect(requestedUrl()).toMatch(/\/products\?limit=30$/);
    expect(productsFixture).toHaveLength(24);
    expect(products).toHaveLength(20);
    expect(new Set(products.map((product) => product.id)).size).toBe(20);
  });

  it('uses https for images', async () => {
    mockResponse(productsFixture);

    const products = await getProducts();

    expect(products.every((product) => product.imageUrl.startsWith('https://'))).toBe(true);
  });

  it('returns every match when searching', async () => {
    mockResponse(productsFixture);

    const products = await getProducts('  galaxy s24 ');

    expect(requestedUrl()).toMatch(/\/products\?search=galaxy%20s24$/);
    expect(products).toHaveLength(23);
  });

  it('throws when the API fails', async () => {
    mockResponse({ message: 'Internal error' }, 500);

    await expect(getProducts()).rejects.toThrow('API request failed: 500');
  });
});

describe('getProductById', () => {
  it('returns null when the product does not exist', async () => {
    mockResponse({ message: 'Not found' }, 404);

    await expect(getProductById('unknown')).resolves.toBeNull();
  });

  it('uses the cheapest storage option as base price', async () => {
    mockResponse(galaxyFixture);

    const product = await getProductById('SMG-S24U');

    expect(galaxyFixture.basePrice).toBe(1329);
    expect(product?.basePrice).toBe(1229);
  });

  it('uses https for color images and similar products', async () => {
    mockResponse(galaxyFixture);

    const product = await getProductById('SMG-S24U');

    const urls = [
      ...product!.colorOptions.map((color) => color.imageUrl),
      ...product!.similarProducts.map((similar) => similar.imageUrl),
    ];
    expect(urls.every((url) => url.startsWith('https://'))).toBe(true);
  });

  it('removes duplicated similar products', async () => {
    mockResponse(redmiFixture);

    const product = await getProductById('XIA-RN13');

    expect(product?.similarProducts.map((similar) => similar.id)).toEqual([
      'XMI-RN13P5G',
      'GPX-8A',
      'SNY-XPERIA1V',
      'XMI-14',
      'SMG-A25',
    ]);
  });

  it('removes the product itself from similar products', async () => {
    mockResponse({
      ...galaxyFixture,
      similarProducts: [galaxyFixture, ...galaxyFixture.similarProducts],
    });

    const product = await getProductById('SMG-S24U');

    expect(product?.similarProducts.map((similar) => similar.id)).not.toContain('SMG-S24U');
  });
});
