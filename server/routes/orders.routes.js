const router = require('express').Router();
const db = require('../db');

// POST /api/orders
// { items: [{ id, name, price, qty }] }
// Creates an order + its line items inside a transaction.
router.post('/', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!items.length) {
    return res.status(400).json({
      error: 'items required'
    });
  }

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.qty),
    0
  );

  const itemCount = items.reduce(
    (sum, item) =>
      sum + Number(item.qty),
    0
  );

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (total, item_count)
       VALUES ($1, $2)
       RETURNING id, created_at`,
      [total, itemCount]
    );

    const order = orderResult.rows[0];

    // Create order items
    const params = [];

    const tuples = items.map((item, index) => {
      const offset = index * 5;

      params.push(
        order.id,
        item.id || null,
        item.name,
        Number(item.price),
        Number(item.qty)
      );

      return `(
        $${offset + 1},
        $${offset + 2},
        $${offset + 3},
        $${offset + 4},
        $${offset + 5}
      )`;
    });

    await client.query(
      `INSERT INTO order_items
       (order_id, product_id, name, price, qty)
       VALUES ${tuples.join(', ')}`,
      params
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: order.id,
      total,
      item_count: itemCount,
      created_at: order.created_at
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Order creation failed:', error);

    res.status(500).json({
      error: error.message || 'Failed to create order'
    });

  } finally {
    client.release();
  }
});

module.exports = router;