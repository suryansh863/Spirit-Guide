const express = require('express');
const router = express.Router();

// GET /api/spirits
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM spirits LIMIT 50');
    client.release();
    
    res.json({
      success: true,
      spirits: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch spirits'
    });
  }
});

// GET /api/spirits/types
router.get('/types', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT DISTINCT type FROM spirits WHERE type IS NOT NULL ORDER BY type');
    client.release();
    
    res.json({
      success: true,
      types: result.rows.map(row => row.type)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch spirit types'
    });
  }
});

// GET /api/spirits/flavors
router.get('/flavors', async (req, res) => {
  try {
    // For now, return common flavor profiles
    res.json({
      success: true,
      flavors: [
        'Smooth', 'Bold', 'Sweet', 'Dry', 'Fruity', 'Spicy', 
        'Herbal', 'Smoky', 'Citrus', 'Vanilla', 'Caramel', 'Oak'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch flavor profiles'
    });
  }
});

// GET /api/spirits/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM spirits WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Spirit not found'
      });
    }
    
    res.json({
      success: true,
      spirit: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch spirit'
    });
  }
});

// GET /api/drinks (alias for /api/spirits)
router.get('/drinks', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT * FROM spirits LIMIT 50');
    client.release();
    
    res.json({
      success: true,
      drinks: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch drinks'
    });
  }
});

// GET /api/drinks/types (alias for /api/spirits/types)
router.get('/drinks/types', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const client = await pool.connect();
    
    const result = await client.query('SELECT DISTINCT type FROM spirits WHERE type IS NOT NULL ORDER BY type');
    client.release();
    
    res.json({
      success: true,
      types: result.rows.map(row => row.type)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch drink types'
    });
  }
});

// GET /api/drinks/flavors (alias for /api/spirits/flavors)
router.get('/drinks/flavors', async (req, res) => {
  try {
    // For now, return common flavor profiles
    res.json({
      success: true,
      flavors: [
        'Smooth', 'Bold', 'Sweet', 'Dry', 'Fruity', 'Spicy', 
        'Herbal', 'Smoky', 'Citrus', 'Vanilla', 'Caramel', 'Oak'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch flavor profiles'
    });
  }
});

module.exports = router;
