import type { ProductDetail, ProductSummary } from '../../src/features/catalog/model/product';

export const productList: ProductSummary[] = [
  {
    id: 'ZmGrkLRPXOTpxsU4jjAcv', brand: 'Acer', model: 'Iconia Talk S', priceText: '170',
    imageUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
  },
  ...Array.from({ length: 36 }, (_, index) => ({
    id: `fixture-${index + 2}`,
    brand: index % 2 ? 'Alcatel' : 'Acer',
    model: `Phone Model ${index + 2}`,
    priceText: index === 0 ? null : `${100 + index}`,
    imageUrl: null,
  })),
];

export const productDetail: ProductDetail = {
  ...productList[0]!,
  attributes: {
    cpu: 'Quad-core 1.3 GHz Cortex-A53', ram: '2 GB RAM', operatingSystem: 'Android 6.0 (Marshmallow)',
    screenResolution: '720 x 1280 pixels (~210 ppi pixel density)',
    battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
    cameras: ['13 MP', 'autofocus', '2 MP', '720p'],
    dimensions: '191.7 x 101 x 9.4 mm', weight: '260',
  },
  colors: [{ code: 1000, label: 'Black' }],
  storages: [{ code: 2000, label: '16 GB' }, { code: 2001, label: '32 GB' }],
  purchaseUnavailableReason: null,
};

export const rawProductDetail = {
  id: productDetail.id,
  brand: productDetail.brand,
  model: productDetail.model,
  price: productDetail.priceText,
  imgUrl: productDetail.imageUrl,
  cpu: productDetail.attributes.cpu,
  ram: productDetail.attributes.ram,
  os: productDetail.attributes.operatingSystem,
  displayResolution: productDetail.attributes.screenResolution,
  battery: productDetail.attributes.battery,
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: ['2 MP', '720p'],
  dimentions: productDetail.attributes.dimensions,
  weight: productDetail.attributes.weight,
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [{ code: 2000, name: '16 GB' }, { code: 2001, name: '32 GB' }],
  },
};
