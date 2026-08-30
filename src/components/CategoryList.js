import { memo } from 'react';

// Vertical, scrollable category rail. `active` is a category id or 'all'.
function CategoryList({ categories, active, onSelect }) {
  const item = (id, label) => {
    const on = active === id;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={
          'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ' +
          (on ? 'bg-brand text-white' : 'text-gray-700 hover:bg-gray-100')
        }
      >
        {label}
      </button>
    );
  };

  return (
    <aside className="w-40 shrink-0 border-r bg-white overflow-y-auto p-2 space-y-1">
      {item('all', 'All Items')}
      {categories.map((c) => item(c.id, c.name))}
    </aside>
  );
}

export default memo(CategoryList);
