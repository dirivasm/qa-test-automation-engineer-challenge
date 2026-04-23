import { test, expect } from '@fixtures/test';

/**
 * Product catalog API tests (API-01, API-02, API-03).
 *
 * Verify that the product catalog the API exposes is complete and
 * well-formed — so the shop always has reliable data to display.
 */

test.describe('Product catalog API', () => {
  test('API-01 — the product catalog is available and every item has a name, price, brand and category @p0', async ({
    productsApi,
  }) => {
    const res = await productsApi.list();
    expect(res.responseCode).toBe(200);
    expect(Array.isArray(res.products)).toBeTruthy();
    expect(res.products!.length).toBeGreaterThan(0);

    const first = res.products![0]!;
    expect(first).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      price: expect.any(String),
      brand: expect.any(String),
    });
    expect(first.category?.category).toBeTruthy();
  });

  test('API-02 — searching for a keyword returns products whose names match that keyword', async ({
    productsApi,
  }) => {
    const res = await productsApi.search('top');
    expect(res.responseCode).toBe(200);
    expect(res.products?.length ?? 0).toBeGreaterThan(0);
    const names = res.products!.map((p) => p.name.toLowerCase());
    expect(names.some((n) => n.includes('top'))).toBeTruthy();
  });

  test('API-03 — a search request submitted without a keyword is rejected with a clear error', async ({
    productsApi,
  }) => {
    const res = await productsApi.search(undefined);
    expect(res.responseCode).toBe(400);
    expect(res.message ?? '').toMatch(/bad request|missing|search_product/i);
  });
});
