const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../auth');

router.use(requireAuth);

// GET /api/dashboard  -> today's order count, sales, and a 7-day trend.
router.get('/', async (_req, res) => {
  const [[today]] = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS sales
     FROM orders WHERE created_at::date = CURRENT_DATE`
  );
  const [trend] = await pool.query(
    `SELECT created_at::date AS day, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS sales
     FROM orders
     WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY created_at::date ORDER BY day`
  );
  res.json({
    today: { orders: today.orders, sales: today.sales },
    trend,
  });
});

module.exports = router;
