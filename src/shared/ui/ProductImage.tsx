import { useState } from 'react';

export function ProductImage({ src, alt, className, eager = false }: {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`image-fallback ${className ?? ''}`} role="img" aria-label={`${alt} image unavailable`}>
      <span aria-hidden="true">◫</span>
    </div>;
  }
  return <img
    className={className}
    src={src}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={() => setFailed(true)}
  />;
}
