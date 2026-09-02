const router = require('express').Router();

const pool = require('../db');
const { requireAuth } = require('../auth');



router.use(requireAuth);

// GET /api/dashboard
// Today's order count, sales, and 7-day trend.
router.get('/', async (_req, res) => {
  // Today's summary
  const todayResult = await pool.query(
    `SELECT
       COUNT(*) AS orders,
       COALESCE(SUM(total), 0) AS sales
     FROM orders
     WHERE created_at::date = CURRENT_DATE`
  );

  // 7-day trend
  const trendResult = await pool.query(
    `SELECT
       created_at::date AS day,
       COUNT(*) AS orders,
       COALESCE(SUM(total), 0) AS sales
     FROM orders
     WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY created_at::date
     ORDER BY day`
  );

  

  const today = todayResult[0][0];

  res.json({
    today: {
      orders: today.orders,
      sales: today.sales
    },
    trend: trendResult[0]
  });
});

module.exports = router;