import type { ProductDetail, ProductSummary, VariantOption } from './product';

const defaultApiOrigin = 'https://itx-frontend-test.onrender.com';

export class ProductContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductContractError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredId(value: unknown): string {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.trim() === '') {
    throw new ProductContractError('Product response is missing a valid identifier.');
  }
  return value.id;
}

function optionalText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() ? value : null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function safeImageUrl(value: unknown, apiBaseUrl = defaultApiOrigin): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === new URL(apiBaseUrl).origin ? url.href : null;
  } catch {
    return null;
  }
}

function summaryFromRecord(record: Record<string, unknown>, id: string, apiBaseUrl: string): ProductSummary {
  return {
    id,
    brand: optionalText(record.brand),
    model: optionalText(record.model),
    priceText: optionalText(record.price),
    imageUrl: safeImageUrl(record.imgUrl, apiBaseUrl),
  };
}

export function normalizeProductList(payload: unknown, apiBaseUrl = defaultApiOrigin): ProductSummary[] {
  if (!Array.isArray(payload)) throw new ProductContractError('Product list response must be an array.');
  const ids = new Set<string>();
  return payload.map((item) => {
    const id = requiredId(item);
    if (ids.has(id)) throw new ProductContractError('Product list contains a duplicate identifier.');
    ids.add(id);
    return summaryFromRecord(item, id, apiBaseUrl);
  });
}

function normalizeOptions(value: unknown): { options: VariantOption[]; valid: boolean } {
  if (!Array.isArray(value) || value.length === 0) return { options: [], valid: false };
  const seen = new Set<string>();
  const options: VariantOption[] = [];
  for (const item of value) {
    if (!isRecord(item)
      || (typeof item.code !== 'string' && !(typeof item.code === 'number' && Number.isFinite(item.code)))
      || typeof item.name !== 'string'
      || item.name.trim() === '') {
      return { options: [], valid: false };
    }
    const token = `${typeof item.code}:${String(item.code)}`;
    if (seen.has(token)) return { options: [], valid: false };
    seen.add(token);
    options.push({ code: item.code, label: item.name });
  }
  return { options, valid: true };
}

function cameraValues(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => {
    const text = optionalText(item);
    return text ? [text] : [];
  });
}

export function normalizeDetail(payload: unknown, requestedId: string, apiBaseUrl = defaultApiOrigin): ProductDetail {
  const id = requiredId(payload);
  if (id !== requestedId) throw new ProductContractError('Product response identity does not match the requested product.');
  if (!isRecord(payload)) throw new ProductContractError('Product detail response must be an object.');

  const rawOptions = isRecord(payload.options) ? payload.options : null;
  const colors = normalizeOptions(rawOptions?.colors);
  const storages = normalizeOptions(rawOptions?.storages);
  const unavailable = !colors.valid || !storages.valid;
  const cameraList = [...cameraValues(payload.primaryCamera), ...cameraValues(payload.secondaryCmera)];

  return {
    ...summaryFromRecord(payload, id, apiBaseUrl),
    attributes: {
      cpu: optionalText(payload.cpu),
      ram: optionalText(payload.ram),
      operatingSystem: optionalText(payload.os),
      screenResolution: optionalText(payload.displayResolution),
      battery: optionalText(payload.battery),
      cameras: cameraList,
      dimensions: optionalText(payload.dimentions),
      weight: optionalText(payload.weight),
    },
    colors: colors.options,
    storages: storages.options,
    purchaseUnavailableReason: unavailable ? 'Purchasing options are unavailable for this product.' : null,
  };
}
