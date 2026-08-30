import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';

export default function POS() {
  const { add } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load categories + all products once.
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products')])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Filter client-side so switching category is instant (no refetch).
  const visible = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category_id === active)),
    [products, active]
  );

  const handleAdd = useCallback((p) => add(p), [add]);

  return (
    <div className="h-full flex">
      {/* Left 2/3: categories rail + product grid */}
      <div className="basis-2/3 grow min-w-0 h-full flex">
        <CategoryList categories={categories} active={active} onSelect={setActive} />
        <div className="flex-1 min-w-0 overflow-y-auto">
          <ProductList products={visible} loading={loading} onAdd={handleAdd} />
        </div>
      </div>

      {/* Right 1/3: cart */}
      <div className="basis-1/3 min-w-[280px] max-w-md h-full">
        <Cart />
      </div>
    </div>
  );
}
