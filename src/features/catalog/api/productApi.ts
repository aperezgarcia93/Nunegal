import { DEFAULT_API_BASE_URL, HttpClient, configuredApiBaseUrl } from '../../../shared/api/http';
import { ProductCache } from '../../../shared/cache/productCache';
import { safeStorage } from '../../../shared/storage/safeStorage';
import { normalizeDetail, normalizeProductList } from '../model/normalizeProduct';
import type { ProductDetail, ProductSummary, VariantOption } from '../model/product';

function isSummary(value: unknown): value is ProductSummary {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<ProductSummary>;
  return typeof item.id === 'string'
    && (typeof item.brand === 'string' || item.brand === null)
    && (typeof item.model === 'string' || item.model === null)
    && (typeof item.priceText === 'string' || item.priceText === null)
    && (typeof item.imageUrl === 'string' || item.imageUrl === null);
}

function isSummaryList(value: unknown): value is ProductSummary[] {
  return Array.isArray(value) && value.every(isSummary)
    && new Set(value.map((item) => item.id)).size === value.length;
}

function isOption(value: unknown): value is VariantOption {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<VariantOption>;
  return (typeof item.code === 'string' || (typeof item.code === 'number' && Number.isFinite(item.code)))
    && typeof item.label === 'string';
}

function isDetail(value: unknown): value is ProductDetail {
  if (!isSummary(value)) return false;
  const detail = value as Partial<ProductDetail>;
  const attributes = detail.attributes;
  if (!attributes || typeof attributes !== 'object') return false;
  const attributeValues = [attributes.cpu, attributes.ram, attributes.operatingSystem, attributes.screenResolution,
    attributes.battery, attributes.dimensions, attributes.weight];
  return attributeValues.every((item) => typeof item === 'string' || item === null)
    && Array.isArray(attributes.cameras) && attributes.cameras.every((item) => typeof item === 'string')
    && Array.isArray(detail.colors) && detail.colors.every(isOption)
    && Array.isArray(detail.storages) && detail.storages.every(isOption)
    && (typeof detail.purchaseUnavailableReason === 'string' || detail.purchaseUnavailableReason === null);
}

export class ProductApi {
  constructor(private readonly http: HttpClient, private readonly cache: ProductCache, private readonly apiBaseUrl = DEFAULT_API_BASE_URL) {}

  getList(): Promise<ProductSummary[]> {
    return this.cache.load('list', isSummaryList, async () => normalizeProductList(await this.http.get('/api/product'), this.apiBaseUrl));
  }

  getDetail(id: string): Promise<ProductDetail> {
    if (!id.trim()) return Promise.reject(new Error('Product identifier is unavailable.'));
    const segment = this.http.pathSegment(id);
    return this.cache.load(`detail:${segment}`, isDetail, async () =>
      normalizeDetail(await this.http.get(`/api/product/${segment}`), id, this.apiBaseUrl));
  }
}

const apiBaseUrl = configuredApiBaseUrl();
const sharedHttp = new HttpClient(apiBaseUrl);
export const productApi = new ProductApi(sharedHttp, new ProductCache(apiBaseUrl, safeStorage), apiBaseUrl);
