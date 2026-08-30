const router = require('express').Router();

const pool = require('../db');
const { requireAuth } = require('../auth');

// Public list with optional ?category=<id> filter (used by the POS screen).
router.get('/', async (req, res) => {
  const { category } = req.query;

  const params = [];

  let sql = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.image,
      p.category_id,
      c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1
  `;

  if (category) {
    sql += ' AND p.category_id = $1';
    params.push(category);
  }

  sql += ' ORDER BY p.name';

  const result = await pool.query(sql, params);

  res.json(result[0]);
});

// CRUD below requires auth.
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { name, price, category_id, image } = req.body || {};

  if (!name || price == null) {
    return res.status(400).json({
      error: 'name and price required'
    });
  }

  const result = await pool.query(
    `INSERT INTO products
      (name, price, category_id, image)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      name,
      price,
      category_id || null,
      image || null
    ]
  );

  res.status(201).json({
    id: result.rows[0].id,
    name,
    price,
    category_id: category_id || null,
    image: image || null
  });
});

router.put('/:id', async (req, res) => {
  const { name, price, category_id, image } = req.body || {};

  await pool.query(
    `UPDATE products
     SET name = $1,
         price = $2,
         category_id = $3,
         image = $4
     WHERE id = $5`,
    [
      name,
      price,
      category_id || null,
      image || null,
      req.params.id
    ]
  );

  res.json({
    id: Number(req.params.id),
    name,
    price,
    category_id: category_id || null,
    image: image || null
  });
});

router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM products WHERE id = $1',
    [req.params.id]
  );

  res.json({ ok: true });
});

module.exports = router;