import type { APIRequestContext } from '@playwright/test';

/**
 * Thin client over automationexercise.com's product/search endpoints.
 *
 * All endpoints return HTTP 200; the actual status is embedded in a
 * JSON body field `responseCode`. This client normalizes that pattern.
 */

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    usertype: { usertype: string };
    category: string;
  };
}

export interface ProductsListResponse {
  responseCode: number;
  products?: Product[];
  message?: string;
}

export class ProductsApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiBaseURL: string,
  ) {}

  /** GET /api/productsList — full catalog. */
  async list(): Promise<ProductsListResponse> {
    const res = await this.request.get(`${this.apiBaseURL}/productsList`);
    return this.parse(await res.text());
  }

  /** POST /api/searchProduct — `search_product` form field. */
  async search(term: string | undefined): Promise<ProductsListResponse> {
    const res = await this.request.post(`${this.apiBaseURL}/searchProduct`, {
      form: term === undefined ? {} : { search_product: term },
    });
    return this.parse(await res.text());
  }

  private parse(body: string): ProductsListResponse {
    try {
      const json = JSON.parse(body) as Partial<ProductsListResponse>;
      return {
        responseCode: Number(json.responseCode ?? 0),
        products: json.products,
        message: json.message,
      };
    } catch {
      return { responseCode: 0, message: body };
    }
  }
}
