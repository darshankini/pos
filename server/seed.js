// Seeds an admin user and a few sample products. Safe to run multiple times.
const bcrypt = require('bcryptjs');
const pool = require('./db');

const SAMPLE_PRODUCTS = [
  ['Starters',    'Veg Spring Roll',   120, 'https://images.unsplash.com/photo-1548507200-47d3ffa7a3b1?w=300&q=60'],
  ['Starters',    'Chicken Wings',     220, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300&q=60'],
  ['Main Course', 'Paneer Butter Masala', 260, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=60'],
  ['Main Course', 'Chicken Biryani',   280, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=60'],
  ['Main Course', 'Butter Naan',        40, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&q=60'],
  ['Beverages',   'Masala Chai',        30, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&q=60'],
  ['Beverages',   'Cold Coffee',        90, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=60'],
  ['Desserts',    'Gulab Jamun',        80, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=60'],
];

(async () => {
  try {
    // Admin user
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (username, password, name) VALUES (?, ?, ?)
       ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
      ['admin', hash, 'Administrator']
    );

    // Map category names -> ids
    const [cats] = await pool.query('SELECT id, name FROM categories');
    const byName = Object.fromEntries(cats.map((c) => [c.name, c.id]));

    for (const [cat, name, price, image] of SAMPLE_PRODUCTS) {
      const [exists] = await pool.query('SELECT id FROM products WHERE name = ?', [name]);
      if (exists.length) continue;
      await pool.query(
        'INSERT INTO products (category_id, name, price, image) VALUES (?, ?, ?, ?)',
        [byName[cat] || null, name, price, image]
      );
    }

    console.log('✔ Seeded admin (admin / admin123) and sample products.');
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
