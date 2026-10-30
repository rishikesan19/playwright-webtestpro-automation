import type { ApiBody, ApiClient, ApiResponse } from './ApiClient';

export interface ApiProduct {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    usertype: { usertype: string };
    category: string;
  };
}

export interface ApiBrand {
  id: number;
  brand: string;
}

export interface ProductsListBody extends ApiBody {
  products?: ApiProduct[];
}

export interface BrandsListBody extends ApiBody {
  brands?: ApiBrand[];
}

/** Documented catalogue endpoints (API 1-6 on https://automationexercise.com/api_list). */
export class ProductApi {
  constructor(private readonly client: ApiClient) {}

  getAllProducts(): Promise<ApiResponse<ProductsListBody>> {
    return this.client.get<ProductsListBody>('productsList');
  }

  /** Documented negative case: POST is not supported on this resource (responseCode 405). */
  postToAllProducts(): Promise<ApiResponse> {
    return this.client.post('productsList');
  }

  getAllBrands(): Promise<ApiResponse<BrandsListBody>> {
    return this.client.get<BrandsListBody>('brandsList');
  }

  /** Documented negative case: PUT is not supported on this resource (responseCode 405). */
  putToAllBrands(): Promise<ApiResponse> {
    return this.client.put('brandsList');
  }

  /** Omit the term to exercise the documented "missing parameter" response (responseCode 400). */
  searchProducts(term?: string): Promise<ApiResponse<ProductsListBody>> {
    return this.client.post<ProductsListBody>(
      'searchProduct',
      term === undefined ? undefined : { search_product: term },
    );
  }
}
