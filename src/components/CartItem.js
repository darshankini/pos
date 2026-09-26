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
      <div className='flex'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 16 16"
        >
          {/* Fire icon */}
          <path
            fill="#FF0000"
            d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16"
          />

          {/* Text inside icon */}
          <text
            x="8"
            y="12"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontSize="5"
            fontWeight="bold"
            fill="white"
          >
            {item.qty - item.kotQty }
          </text>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#22c55e" viewBox="0 0 16 16">
          <path
    fill="#22c55e"
    d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16"
  />
  <text
            x="8"
            y="12"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontSize="5"
            fontWeight="bold"
            fill="white"
          >
            {item.kotQty > 0 ? item.kotQty : 0}
          </text>
        </svg>

      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onDec(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none" >−</button>
        <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
        <button onClick={() => onInc(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none">+</button>
      </div>

      <div className="w-16 text-right text-sm font-semibold tabular-nums">{money(item.price * item.qty)}</div>
      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 px-1" title="Remove">✕</button>
    </li>
  );
}

export default memo(CartItem);
