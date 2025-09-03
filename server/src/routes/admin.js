const express = require('express');
const router = express.Router();

// GET /api/admin
router.get('/', (req, res) => {
  res.json({
    message: 'Admin endpoint - not yet implemented',
    status: 'placeholder'
  });
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const [
      totalSpirits,
      totalPrices,
      totalStates,
      totalRetailers
    ] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM spirits'),
      client.query('SELECT COUNT(*) as count FROM prices'),
      client.query('SELECT COUNT(*) as count FROM states'),
      client.query('SELECT COUNT(*) as count FROM retailers WHERE is_active = true')
    ]);
    
    client.release();
    
    res.json({
      success: true,
      stats: {
        totalSpirits: parseInt(totalSpirits.rows[0].count),
        totalPrices: parseInt(totalPrices.rows[0].count),
        totalStates: parseInt(totalStates.rows[0].count),
        totalRetailers: parseInt(totalRetailers.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch admin stats'
    });
  }
});

module.exports = router;
