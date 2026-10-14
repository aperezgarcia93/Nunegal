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

  it('blocks incomplete selections, preserves the other field, and keeps string code types', () => {
    const onAdd = vi.fn();
    render(<VariantForm
      productId="p" label="Phone"
      colors={[{ code: 'red', label: 'Red' }, { code: 'blue', label: 'Blue' }]}
      storages={[{ code: '64', label: '64 GB' }, { code: 64, label: '64 GB (numeric)' }]}
      purchaseUnavailableReason={null} pending={false} onAdd={onAdd}
    />);
    const add = screen.getByRole('button', { name: 'Add to cart' });
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription('Choose a color and a storage option to continue.');
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Storage'), { target: { value: '0' } });
    expect(screen.getByLabelText('Color')).toHaveValue('1');
    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledWith({ id: 'p', colorCode: 'blue', storageCode: '64' }, 'Phone');
  });

  it('disables controls while an addition is pending', () => {
    const onAdd = vi.fn();
    render(<VariantForm productId="p" label="Phone" colors={[{ code: 1, label: 'Black' }]} storages={[{ code: 2, label: '16 GB' }]}
      purchaseUnavailableReason={null} pending onAdd={onAdd} />);
    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Adding…' }).closest('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
