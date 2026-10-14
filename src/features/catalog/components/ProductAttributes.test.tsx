import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductAttributes } from './ProductAttributes';
import { productDetail } from '../../../../tests/fixtures/products';

function valueOf(label: string): string | null | undefined {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('product attributes', () => {
  it('lists every required attribute with all camera values and no invented units', () => {
    render(<ProductAttributes product={productDetail} />);
    expect(valueOf('CPU')).toBe('Quad-core 1.3 GHz Cortex-A53');
    expect(valueOf('RAM')).toBe('2 GB RAM');
    expect(valueOf('Operating system')).toBe('Android 6.0 (Marshmallow)');
    expect(valueOf('Screen resolution')).toBe('720 x 1280 pixels (~210 ppi pixel density)');
    expect(valueOf('Battery')).toBe('Non-removable Li-Ion 3400 mAh battery (12.92 Wh)');
    expect(valueOf('Cameras')).toBe('13 MP · autofocus · 2 MP · 720p');
    expect(valueOf('Dimensions')).toBe('191.7 x 101 x 9.4 mm');
    expect(valueOf('Weight')).toBe('260 g');
  });

  it('marks absent values as unavailable', () => {
    render(<ProductAttributes product={{
      ...productDetail,
      attributes: { cpu: null, ram: '  ', operatingSystem: null, screenResolution: null, battery: null, cameras: [], dimensions: null, weight: null },
    }} />);
    for (const label of ['CPU', 'RAM', 'Operating system', 'Screen resolution', 'Battery', 'Cameras', 'Dimensions', 'Weight']) {
      expect(valueOf(label)).toBe('Not available');
    }
  });
});
