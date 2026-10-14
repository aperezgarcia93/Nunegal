export type OptionCode = string | number;

export interface ProductSummary {
  id: string;
  brand: string | null;
  model: string | null;
  priceText: string | null;
  imageUrl: string | null;
}

export interface VariantOption {
  code: OptionCode;
  label: string;
}

export interface ProductDetail extends ProductSummary {
  attributes: {
    cpu: string | null;
    ram: string | null;
    operatingSystem: string | null;
    screenResolution: string | null;
    battery: string | null;
    cameras: string[];
    dimensions: string | null;
    weight: string | null;
  };
  colors: VariantOption[];
  storages: VariantOption[];
  purchaseUnavailableReason: string | null;
}
