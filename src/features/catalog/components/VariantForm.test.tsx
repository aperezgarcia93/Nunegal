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
    // Both kinds of option stay visible as button groups; a sole option is pre-checked.
    expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '16 GB' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: '32 GB' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: '32 GB' }));
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
    fireEvent.click(screen.getByRole('radio', { name: 'Blue' }));
    fireEvent.click(screen.getByRole('radio', { name: '64 GB' }));
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '64 GB' })).toBeChecked();
    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledWith({ id: 'p', colorCode: 'blue', storageCode: '64' }, 'Phone');
  });

  it('disables controls while an addition is pending', () => {
    const onAdd = vi.fn();
    render(<VariantForm productId="p" label="Phone" colors={[{ code: 1, label: 'Black' }]} storages={[{ code: 2, label: '16 GB' }]}
      purchaseUnavailableReason={null} pending onAdd={onAdd} />);
    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: '16 GB' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Adding…' }).closest('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
