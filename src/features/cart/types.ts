import type { OptionCode } from '../catalog/model/product';

export interface AddToCartInput {
  id: string;
  colorCode: OptionCode;
  storageCode: OptionCode;
}
