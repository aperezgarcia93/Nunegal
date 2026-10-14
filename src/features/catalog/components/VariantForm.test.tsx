import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VariantForm } from './VariantForm';

describe('variant selection', () => {
  it('keeps selectors visible, defaults sole options, and submits exact numeric codes', () => {
    const onAdd = vi.fn();
    render(<VariantForm
      productId="product-a" label="Acer Iconia"
      colors={[{ code: 0, label: 'Black' }]}
      storages={[{ code: 20, label: '16 GB' }, { code: 21, label: '32 GB' }]}
      purchaseUnavailableReason={null} pending={false} onAdd={onAdd}
    />);
    expect(screen.getByLabelText('Color')).toHaveValue('0');
    fireEvent.change(screen.getByLabelText('Storage'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(onAdd).toHaveBeenCalledWith({ id: 'product-a', colorCode: 0, storageCode: 21 }, 'Acer Iconia');
  });
});
