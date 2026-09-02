const router = require('express').Router();
const db = require('../db');

// GET /api/carts
// Returns all open carts with display-ready items (name/image joined from products):
// [ { cart_id, items: [{ id, name, price, image, qty }] } ]
router.get('/', async (_req, res) => {
  const [carts] = await db.query('SELECT id, cart_id FROM cart ORDER BY id');
  if (!carts.length) return res.json([]);

  const ids = carts.map((c) => c.id);
  const [items] = await db.query(
    `SELECT ci.cart_id AS cref, ci.product_id AS id, p.name, ci.price, p.image, ci.qty
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ANY(?)
     ORDER BY ci.id`,
    [ids]
  );

  const byCart = {};
  for (const it of items) {
    (byCart[it.cref] = byCart[it.cref] || []).push({
      id: it.id,
      name: it.name,
      price: Number(it.price),
      image: it.image,
      qty: it.qty,
    });
  }

  res.json(carts.map((c) => ({ cart_id: c.cart_id, items: byCart[c.id] || [] })));
});

// PUT /api/carts
// Full-state sync. Body: { carts: [{ cart_id, items: [{ id, price, qty }] }] }.
// Replaces every stored cart in one transaction so the DB always mirrors the client.
router.put('/', async (req, res) => {
  const carts = Array.isArray(req.body?.carts) ? req.body.carts : [];
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM cart');

    for (const c of carts) {
      const list = Array.isArray(c.items) ? c.items : [];
      const total = list.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
      const itemCount = list.reduce((s, i) => s + Number(i.qty), 0);

      const r = await client.query(
        'INSERT INTO cart (cart_id, cart_total, item_count) VALUES ($1, $2, $3) RETURNING id',
        [String(c.cart_id), total, itemCount]
      );
      const cid = r.rows[0].id;

      for (const it of list) {
        await client.query(
          'INSERT INTO cart_items (cart_id, product_id, price, qty) VALUES ($1, $2, $3, $4)',
          [cid, Number(it.id), Number(it.price), Number(it.qty)]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true, carts: carts.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cart sync failed:', error);
    res.status(500).json({ error: error.message || 'Failed to sync carts' });
  } finally {
    client.release();
  }
});

module.exports = router;
