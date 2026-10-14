import { http, HttpResponse } from 'msw';
import { rawProductDetail, rawProductList } from '../fixtures/products';

const api = 'https://itx-frontend-test.onrender.com';

export const handlers = [
  http.get(`${api}/api/product`, () => HttpResponse.json(rawProductList)),
  http.get(`${api}/api/product/:id`, ({ params }) => params.id === rawProductDetail.id
    ? HttpResponse.json(rawProductDetail)
    : new HttpResponse(null, { status: 404 })),
  http.post(`${api}/api/cart`, () => HttpResponse.json({ count: 1 })),
  http.all('*', () => HttpResponse.json({ error: 'No test handler was registered for this request.' }, { status: 501 })),
];
