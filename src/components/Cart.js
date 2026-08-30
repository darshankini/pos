import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { money } from './Layout';
import CartItem from './CartItem';
import Receipt from './Receipt';

export default function Cart() {
  const { items, inc, dec, remove, clear, total, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [printData, setPrintData] = useState(null); // { order, items } snapshot for receipt

  const checkout = useCallback(async () => {
    if (!items.length || busy) return;
    setBusy(true);
    try {
      const order = await api.post('/orders', {
        items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      });
      // Snapshot for the receipt, then print and clear.
      setPrintData({ order, items: items.slice() });
      setTimeout(() => {
        window.print();
        clear();
      }, 50);
    } catch (e) {
      alert('Checkout failed: ' + e.message);
    } finally {
      setBusy(false);
    }
  }, [items, busy, clear]);

  return (
    <section className="w-full h-full flex flex-col bg-white border-l">
      <div className="h-12 shrink-0 px-4 flex items-center justify-between border-b">
        <h2 className="font-semibold">Current Order</h2>
        <span className="text-sm text-gray-500">{count} item{count !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable line items */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Cart is empty — tap a product to add.
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((i) => (
              <CartItem key={i.id} item={i} onInc={inc} onDec={dec} onRemove={remove} />
            ))}
          </ul>
        )}
      </div>

      {/* Totals + actions */}
      <div className="shrink-0 border-t p-4 space-y-3">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-brand tabular-nums">{money(total)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={clear}
            disabled={!items.length}
            className="col-span-1 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium disabled:opacity-40"
          >
            Clear
          </button>
          <button
            onClick={checkout}
            disabled={!items.length || busy}
            className="col-span-2 py-2 rounded-md bg-brand hover:bg-brand-dark text-white font-semibold disabled:opacity-40"
          >
            {busy ? 'Saving…' : 'Checkout & Print'}
          </button>
        </div>
      </div>

      {/* Rendered off-screen; visible only during print */}
      {printData && <Receipt order={printData.order} items={printData.items} />}
    </section>
  );
}
