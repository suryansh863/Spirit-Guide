const express = require('express');
const router = express.Router();

// GET /api/states
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM states ORDER BY name');
    client.release();
    
    res.json({
      success: true,
      states: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch states'
    });
  }
});

// GET /api/states/restrictions
router.get('/restrictions', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM states WHERE dry_state = true OR online_delivery_allowed = false ORDER BY name');
    client.release();
    
    res.json({
      success: true,
      restrictions: result.rows.map(state => ({
        name: state.name,
        code: state.code,
        dryState: state.dry_state,
        onlineDeliveryAllowed: state.online_delivery_allowed,
        homeDeliveryAllowed: state.home_delivery_allowed,
        maxQuantityPerPerson: state.max_quantity_per_person
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch state restrictions'
    });
  }
});

module.exports = router;
