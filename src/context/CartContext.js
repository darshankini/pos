import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const CartCtx = createContext(null);

// Cart state is a plain array of { id, name, price, image, qty }.
function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const p = action.product;
      const existing = state.find((i) => i.id === p.id);
      if (existing) {
        return state.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...state, { id: p.id, name: p.name, price: Number(p.price), image: p.image, qty: 1 }];
    }
    case 'inc':
      return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i));
    case 'dec':
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case 'remove':
      return state.filter((i) => i.id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);

  const add = useCallback((product) => dispatch({ type: 'add', product }), []);
  const inc = useCallback((id) => dispatch({ type: 'inc', id }), []);
  const dec = useCallback((id) => dispatch({ type: 'dec', id }), []);
  const remove = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const { total, count } = useMemo(
    () => ({
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      count: items.reduce((s, i) => s + i.qty, 0),
    }),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, inc, dec, remove, clear, total, count }),
    [items, add, inc, dec, remove, clear, total, count]
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
