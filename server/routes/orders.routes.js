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

    console.log(orderResult);
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

// POST /api/orders/:id/customer
// { name?, mobile?, email? } — optional customer details attached to an existing order.
// The order is already saved at checkout; this only adds contact info if the customer gives it.
router.post('/:id/customer', async (req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'invalid order id' });
  }

  let { name, mobile, email } = req.body || {};
  name = (typeof name === 'string' && name.trim()) || null;
  email = (typeof email === 'string' && email.trim()) || null;

  // Mobile: optional; if provided it must be exactly 10 digits (matches the DB CHECK).
  let mobileNum = null;
  const rawMobile = mobile == null ? '' : String(mobile).replace(/\D/g, '');
  if (rawMobile) {
    if (rawMobile.length !== 10) {
      return res.status(400).json({ error: 'mobile must be 10 digits' });
    }
    mobileNum = Number(rawMobile);
  }

  try {
    // Make sure the order exists before linking a customer to it.
    const [orders] = await db.query('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (!orders.length) return res.status(404).json({ error: 'order not found' });

    const [rows] = await db.query(
      `INSERT INTO customers (order_id, customer_name, customer_mobile, customer_email)
       VALUES (?, ?, ?, ?) RETURNING id`,
      [orderId, name, mobileNum, email]
    );
    res.status(201).json({ id: rows[0].id, order_id: orderId });
  } catch (error) {
    console.error('Attach customer failed:', error);
    res.status(500).json({ error: error.message || 'Failed to save customer' });
  }
});

module.exports = router;