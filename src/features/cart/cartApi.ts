import { HttpClient, configuredApiBaseUrl } from '../../shared/api/http';
import { HttpError } from '../../shared/api/http';
import type { AddToCartInput } from './types';

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export class CartApi {
  constructor(private readonly http: Pick<HttpClient, 'post'>) {}

  async add(input: AddToCartInput): Promise<number> {
    const result = await this.http.post('/api/cart', input);
    if (typeof result !== 'object' || result === null || !('count' in result) || !isCount(result.count)) {
      throw new HttpError('invalid-response', 'The service did not confirm the cart count.');
    }
    return result.count;
  }
}

const cartHttp = new HttpClient(configuredApiBaseUrl());
export const cartApi = new CartApi(cartHttp);
