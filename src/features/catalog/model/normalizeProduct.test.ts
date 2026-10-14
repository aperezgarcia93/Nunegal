import { describe, expect, it } from 'vitest';
import { normalizeDetail, normalizeProductList, ProductContractError } from './normalizeProduct';

const summary = {
  id: 'opaque_1-2', brand: 'Acer', model: 'Iconia', price: '',
  imgUrl: 'https://itx-frontend-test.onrender.com/images/phone.jpg',
};

describe('product contract normalization', () => {
  it('keeps opaque identity and blank price while normalizing the observed detail shape', () => {
    const product = normalizeDetail({
      ...summary,
      cpu: 'Quad-core', ram: '2 GB RAM', os: 'Android', displayResolution: '720 x 1280 pixels',
      battery: '3400 mAh', primaryCamera: ['13 MP', 'autofocus'], secondaryCmera: ['2 MP'],
      dimentions: '191 x 101 x 9 mm', weight: '260',
      options: { colors: [{ code: 0, name: 'Black' }], storages: [{ code: 2000, name: '16 GB' }] },
    }, summary.id);

    expect(product.id).toBe(summary.id);
    expect(product.priceText).toBeNull();
    expect(product.attributes.screenResolution).toBe('720 x 1280 pixels');
    expect(product.attributes.cameras).toEqual(['13 MP', 'autofocus', '2 MP']);
    expect(product.colors[0]?.code).toBe(0);
    expect(product.storages[0]?.code).toBe(2000);
    expect(product.purchaseUnavailableReason).toBeNull();
  });

  it('rejects malformed lists and duplicate identities rather than dropping entries', () => {
    expect(() => normalizeProductList([summary, summary])).toThrow(ProductContractError);
    expect(() => normalizeProductList({ products: [summary] })).toThrow(ProductContractError);
  });

  it('makes malformed options unavailable and rejects an identity mismatch', () => {
    const detail = { ...summary, options: { colors: [{ name: 'Black' }], storages: [] } };
    expect(normalizeDetail(detail, summary.id).purchaseUnavailableReason).toBeTruthy();
    expect(() => normalizeDetail({ ...summary, id: 'different' }, summary.id)).toThrow(ProductContractError);
  });
});
