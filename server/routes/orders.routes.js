const router = require('express').Router();
const db = require('../db');

// POST /api/orders  { items: [{ id, name, price, qty }] }
// Creates an order + its line items inside a transaction; returns saved order.
router.post('/', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: 'items required' });

  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const itemCount = items.reduce((s, i) => s + Number(i.qty), 0);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const o = await client.query(
      'INSERT INTO orders (total, item_count) VALUES ($1, $2) RETURNING id, created_at',
      [total, itemCount]
    );
    const order = o.rows[0];

    // Build a single multi-row INSERT: VALUES ($1,$2,..),($6,$7,..),...
    const params = [];
    const tuples = items.map((it, idx) => {
      const b = idx * 5;
      params.push(order.id, it.id || null, it.name, it.price, it.qty);
      return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5})`;
    });
    await client.query(
      `INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES ${tuples.join(', ')}`,
      params
    );

    await client.query('COMMIT');
    res.status(201).json({ id: order.id, total, item_count: itemCount, created_at: order.created_at });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;
