const express = require('express');
const router = express.Router();

// GET /api/retailers
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM retailers WHERE is_active = true ORDER BY name');
    client.release();
    
    res.json({
      success: true,
      retailers: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch retailers'
    });
  }
});

module.exports = router;
