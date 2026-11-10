const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  // For the hackathon demo, default to provider 1 if not specified
  const provider_id = req.query.provider_id || 1;

  try {
    // 1. Calculate Total Revenue for this specific provider
    // We only count funds that have been successfully allocated in the PaymentSplits table
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM PaymentSplits
      WHERE provider_id = $1 AND status = 'allocated'
    `;
    const revenueResult = await pool.query(revenueQuery, [provider_id]);
    const total_revenue = parseFloat(revenueResult.rows[0].total_revenue);

    // 2. Calculate Total Number of Tests performed by this provider
    // We join OrderItems with Orders to ensure we only count tests from successful payments
    const testsQuery = `
      SELECT COUNT(*) AS number_of_tests
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.id
      WHERE oi.provider_id = $1 AND o.payment_status = 'successful'
    `;
    const testsResult = await pool.query(testsQuery, [provider_id]);
    const number_of_tests = parseInt(testsResult.rows[0].number_of_tests, 10);

    // 3. Fetch Recent Transactions (The Paper Trail)
    // This query pulls the split amount, transaction ID, and the patient's name
    const transactionsQuery = `
      SELECT 
        ps.transaction_id, 
        ps.amount AS revenue_share, 
        o.patient_name, 
        o.created_at
      FROM PaymentSplits ps
      JOIN Transactions tx ON ps.transaction_id = tx.id
      JOIN Orders o ON tx.order_id = o.id
      WHERE ps.provider_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `;
    const transactionsResult = await pool.query(transactionsQuery, [provider_id]);

    // 4. Return the aggregated data exactly as the PRD requires
    res.status(200).json({
      total_revenue: total_revenue,
      number_of_tests: number_of_tests,
      transactions: transactionsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error while fetching dashboard data.' });
  }
});

module.exports = router;
