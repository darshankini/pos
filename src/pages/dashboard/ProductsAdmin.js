import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { money } from '../../components/Layout';

const EMPTY = { name: '', price: '', category_id: '', image: '' };

export default function ProductsAdmin() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([p, c]) => { setRows(p); setCats(c); })
      .catch((e) => alert(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => { setForm(EMPTY); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '') return;
    const body = {
      name: form.name,
      price: Number(form.price),
      category_id: form.category_id ? Number(form.category_id) : null,
      image: form.image || null,
    };
    try {
      if (editingId) await api.put(`/products/${editingId}`, body);
      else await api.post('/products', body);
      reset(); load();
    } catch (err) { alert(err.message); }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, category_id: p.category_id || '', image: p.image || '' });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.del(`/products/${id}`); load();
  };

  const input = 'rounded-md border px-3 py-1.5 text-sm outline-none focus:border-brand';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Products</h3>
      <form onSubmit={save} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <input className={input} placeholder="Name" value={form.name} onChange={set('name')} />
        <input className={input} placeholder="Price" type="number" step="0.01" value={form.price} onChange={set('price')} />
        <select className={input} value={form.category_id} onChange={set('category_id')}>
          <option value="">No category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={input} placeholder="Image URL" value={form.image} onChange={set('image')} />
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 rounded-md bg-brand text-white text-sm">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={reset} className="px-3 py-1.5 rounded-md bg-gray-200 text-sm">Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr><th className="py-2">Item</th><th>Category</th><th className="text-right">Price</th><th></th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="py-2 flex items-center gap-2">
                  {p.image && <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />}
                  {p.name}
                </td>
                <td className="text-gray-500">{p.category || '—'}</td>
                <td className="text-right tabular-nums">{money(p.price)}</td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => edit(p)} className="text-brand hover:underline mr-3">Edit</button>
                  <button onClick={() => del(p.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
