import { memo } from 'react';
import { money } from './Layout';

// One cart line: image, name, qty stepper, line total, remove.
function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <li className="flex items-center gap-2 py-2">
      <img
        src={item.image}
        alt=""
        className="h-10 w-10 rounded object-cover bg-gray-100 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{money(item.price)}</div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onDec(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none">−</button>
        <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
        <button onClick={() => onInc(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none">+</button>
      </div>

      <div className="w-16 text-right text-sm font-semibold tabular-nums">{money(item.price * item.qty)}</div>
      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 px-1" title="Remove">✕</button>
    </li>
  );
}

export default memo(CartItem);
