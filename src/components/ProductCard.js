import { memo } from 'react';
import { money } from './Layout';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="52%" font-size="40" text-anchor="middle" fill="#9ca3af">🍴</text></svg>'
  );

// One product tile. memo'd so the grid doesn't re-render tiles that didn't change.
function ProductCard({ product,qty, onAdd,onDec,onInc }) {
  return (
    <div
      className="group flex flex-col rounded-lg border bg-white overflow-hidden text-left hover:shadow-md hover:border-brand transition"
    >
      <img
        src={product.image || FALLBACK}
        alt={product.name}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = FALLBACK; }}
        className="h-24 w-full object-cover bg-gray-100"
      />
      <div className="p-2">
        <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-brand font-semibold">{money(product.price)}</span>
          <span className="text-xs text-white rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition">
            {qty > 0 ? (
            <div className="inline-flex items-center rounded-full text-white overflow-hidden">
              <button onClick={() => onDec(product.id)} className="h-6 w-6 rounded bg-brand hover:bg-brand-300 leading-none">−</button>
              <span className="w-6 text-center text-sm tabular-nums text-black">{qty}</span>
              <button onClick={() => onInc(product.id)} className="h-6 w-6 rounded bg-brand hover:bg-brand-300 leading-none">+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(product)} className="h-7 text-xs text-white bg-brand rounded-full font-semibold px-3 hover:bg-brand-dark">+ Add</button>
          )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
