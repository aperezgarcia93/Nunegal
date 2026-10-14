import { useState, type FormEvent } from 'react';
import type { OptionCode, VariantOption } from '../model/product';
import type { AddToCartInput } from '../../cart/types';
import styles from './VariantForm.module.css';

function uniqueOptions(options: VariantOption[]): boolean {
  const tokens = options.map(({ code }) => `${typeof code}:${String(code)}`);
  return options.length > 0 && tokens.every((token, index) => token !== 'undefined:undefined' && tokens.indexOf(token) === index);
}

/** One kind of option as a row of pill buttons (radio semantics), as in the brief's wireframe. */
function OptionGroup({ legend, name, options, value, disabled, onChange }: {
  legend: string;
  name: string;
  options: VariantOption[];
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return <fieldset className={styles.group} disabled={disabled}>
    <legend>{legend}</legend>
    <div className={styles.options}>
      {options.map((option, index) => {
        const checked = value === String(index);
        return <label key={`${typeof option.code}:${String(option.code)}`} className={styles.option}>
          <input type="radio" name={name} value={String(index)} checked={checked} onChange={(event) => onChange(event.target.value)} />
          {checked && <span className={styles.check} aria-hidden="true">✓</span>}
          {option.label}
        </label>;
      })}
      {!options.length && <span className={styles.empty}>Not available</span>}
    </div>
  </fieldset>;
}

export function VariantForm({ productId, label, colors, storages, purchaseUnavailableReason, pending, onAdd }: {
  productId: string;
  label: string;
  colors: VariantOption[];
  storages: VariantOption[];
  purchaseUnavailableReason: string | null;
  pending: boolean;
  onAdd: (input: AddToCartInput, label: string) => void;
}) {
  // The parent keys this form by product identity, so a new product always starts a fresh selection.
  const [current, setSelection] = useState(() => ({
    color: colors.length === 1 ? '0' : '',
    storage: storages.length === 1 ? '0' : '',
  }));
  const validOptions = uniqueOptions(colors) && uniqueOptions(storages) && !purchaseUnavailableReason;
  const selectedColor = current.color === '' ? undefined : colors[Number(current.color)];
  const selectedStorage = current.storage === '' ? undefined : storages[Number(current.storage)];
  const ready = validOptions && selectedColor !== undefined && selectedStorage !== undefined;
  const missing = [!selectedColor && 'a color', !selectedStorage && 'a storage option'].filter(Boolean).join(' and ');
  const hint = purchaseUnavailableReason || (missing ? `Choose ${missing} to continue.` : '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || pending || !selectedColor || !selectedStorage) return;
    const input: AddToCartInput = { id: productId, colorCode: selectedColor.code as OptionCode, storageCode: selectedStorage.code as OptionCode };
    onAdd(input, label);
  }

  return <form className={styles.form} onSubmit={submit}>
    <OptionGroup legend="Color" name={`color-${productId}`} options={colors} value={current.color}
      disabled={!validOptions || pending} onChange={(color) => setSelection({ ...current, color })} />
    <OptionGroup legend="Storage" name={`storage-${productId}`} options={storages} value={current.storage}
      disabled={!validOptions || pending} onChange={(storage) => setSelection({ ...current, storage })} />
    {hint && <p id="variant-hint" className={styles.hint}>{hint}</p>}
    <button className="button button--primary" type="submit" disabled={!ready || pending} aria-describedby={hint ? 'variant-hint' : undefined}>
      {pending ? 'Adding…' : 'Add to cart'}
    </button>
  </form>;
}
