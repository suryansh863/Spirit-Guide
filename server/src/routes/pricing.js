const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool, getRedisClient } = require('../database/connection');
const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for pricing endpoints
const pricingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many pricing requests, please try again later.',
    retryAfter: 15
  }
});

// Apply rate limiting to all pricing routes
router.use(pricingLimiter);

// Get current prices for a spirit across all Indian states
router.get('/spirit/:spiritId', async (req, res) => {
  try {
    const { spiritId } = req.params;
    const { state, retailer } = req.query;

    // Validate spirit ID
    if (!spiritId || isNaN(spiritId)) {
      return res.status(400).json({
        error: 'Invalid spirit ID',
        message: 'Spirit ID must be a valid number'
      });
    }

    // Check cache first
    const redisClient = getRedisClient();
    const cacheKey = `pricing:spirit:${spiritId}:${state || 'all'}:${retailer || 'all'}`;
    
    if (redisClient && redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        logger.info(`Cache hit for spirit ${spiritId}`);
        return res.json(parsed);
      }
    }

    // Build query based on filters
    let query = `
      SELECT 
        p.id,
        p.spirit_id,
        p.state_id,
        p.retailer_id,
        p.base_price,
        p.final_price,
        p.tax_amount,
        p.mrp_price,
        p.discount_percentage,
        p.availability_status,
        p.delivery_charges,
        p.minimum_order_amount,
        p.scraped_at,
        s.name as state_name,
        s.code as state_code,
        s.dry_state,
        s.online_delivery_allowed,
        s.home_delivery_allowed,
        s.max_quantity_per_person,
        r.name as retailer_name,
        r.retailer_type,
        r.delivery_available,
        sp.name as spirit_name,
        sp.brand as spirit_brand,
        sp.type as spirit_type,
        sp.manufacturer,
        sp.bottle_size,
        sp.mrp as spirit_mrp,
        sp.is_indian_brand
      FROM prices p
      JOIN states s ON p.state_id = s.id
      JOIN retailers r ON p.retailer_id = r.id
      JOIN spirits sp ON p.spirit_id = sp.id
      WHERE p.spirit_id = $1
    `;

    const queryParams = [spiritId];
    let paramCount = 1;

    if (state) {
      paramCount++;
      query += ` AND s.code = $${paramCount}`;
      queryParams.push(state);
    }

    if (retailer) {
      paramCount++;
      query += ` AND r.id = $${paramCount}`;
      queryParams.push(retailer);
    }

    query += ` ORDER BY p.final_price ASC, p.scraped_at DESC`;

    const client = await pool.connect();
    const result = await client.query(query, queryParams);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No pricing data found',
        message: `No pricing information available for spirit ID ${spiritId}`
      });
    }

    // Group prices by state
    const pricesByState = {};
    result.rows.forEach(row => {
      if (!pricesByState[row.state_code]) {
        pricesByState[row.state_code] = {
          state: {
            id: row.state_id,
            name: row.state_name,
            code: row.state_code,
            dryState: row.dry_state,
            onlineDeliveryAllowed: row.online_delivery_allowed,
            homeDeliveryAllowed: row.home_delivery_allowed,
            maxQuantityPerPerson: row.max_quantity_per_person
          },
          prices: []
        };
      }

      pricesByState[row.state_code].prices.push({
        id: row.id,
        retailer: {
          id: row.retailer_id,
          name: row.retailer_name,
          type: row.retailer_type,
          deliveryAvailable: row.delivery_available
        },
        basePrice: parseFloat(row.base_price),
        finalPrice: parseFloat(row.final_price),
        taxAmount: parseFloat(row.tax_amount),
        mrpPrice: row.mrp_price ? parseFloat(row.mrp_price) : null,
        discountPercentage: row.discount_percentage ? parseFloat(row.discount_percentage) : 0,
        deliveryCharges: row.delivery_charges ? parseFloat(row.delivery_charges) : 0,
        minimumOrderAmount: row.minimum_order_amount ? parseFloat(row.minimum_order_amount) : 0,
        availability: row.availability_status,
        lastUpdated: row.scraped_at
      });
    });

    const response = {
      spirit: {
        id: parseInt(spiritId),
        name: result.rows[0].spirit_name,
        brand: result.rows[0].spirit_brand,
        type: result.rows[0].spirit_type,
        manufacturer: result.rows[0].manufacturer,
        bottleSize: result.rows[0].bottle_size,
        mrp: result.rows[0].spirit_mrp,
        isIndianBrand: result.rows[0].is_indian_brand
      },
      pricing: Object.values(pricesByState),
      totalStates: Object.keys(pricesByState).length,
      totalPrices: result.rows.length,
      lastUpdated: new Date(Math.max(...result.rows.map(r => new Date(r.scraped_at))))
    };

    // Cache the response for 5 minutes
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    }

    res.json(response);

  } catch (error) {
    logger.error('Error fetching pricing data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch pricing data'
    });
  }
});

// Get price comparison across Indian retailers for a specific spirit and state
router.get('/compare/:spiritId/:stateCode', async (req, res) => {
  try {
    const { spiritId, stateCode } = req.params;

    // Validate parameters
    if (!spiritId || isNaN(spiritId)) {
      return res.status(400).json({
        error: 'Invalid spirit ID',
        message: 'Spirit ID must be a valid number'
      });
    }

    if (!stateCode || stateCode.length !== 2) {
      return res.status(400).json({
        error: 'Invalid state code',
        message: 'State code must be 2 characters'
      });
    }

    // Check cache
    const redisClient = getRedisClient();
    const cacheKey = `pricing:compare:${spiritId}:${stateCode}`;
    
    if (redisClient && redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
    }

    // Get price comparison using Indian database function
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM get_indian_price_comparison($1, (SELECT id FROM states WHERE code = $2))',
      [spiritId, stateCode]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No comparison data found',
        message: `No pricing comparison available for spirit ID ${spiritId} in state ${stateCode}`
      });
    }

    // Get spirit information
    const spiritClient = await pool.connect();
    const spiritResult = await spiritClient.query(
      'SELECT id, name, brand, type, manufacturer, bottle_size, mrp FROM spirits WHERE id = $1',
      [spiritId]
    );
    spiritClient.release();

    if (spiritResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Spirit not found',
        message: `Spirit with ID ${spiritId} not found`
      });
    }

    const spirit = spiritResult.rows[0];

    // Format comparison data
    const comparison = {
      spirit: {
        id: spirit.id,
        name: spirit.name,
        brand: spirit.brand,
        type: spirit.type,
        manufacturer: spirit.manufacturer,
        bottleSize: spirit.bottle_size,
        mrp: spirit.mrp
      },
      state: stateCode,
      comparison: result.rows.map(row => ({
        retailer: row.retailer_name,
        basePrice: parseFloat(row.base_price),
        finalPrice: parseFloat(row.final_price),
        taxAmount: parseFloat(row.tax_amount),
        mrpPrice: row.mrp_price ? parseFloat(row.mrp_price) : null,
        discountPercentage: row.discount_percentage ? parseFloat(row.discount_percentage) : 0,
        deliveryCharges: row.delivery_charges ? parseFloat(row.delivery_charges) : 0,
        availability: row.availability_status,
        lastUpdated: row.last_updated
      })),
      summary: {
        lowestPrice: Math.min(...result.rows.map(r => parseFloat(r.final_price))),
        highestPrice: Math.max(...result.rows.map(r => parseFloat(r.final_price))),
        averagePrice: result.rows.reduce((sum, r) => sum + parseFloat(r.final_price), 0) / result.rows.length,
        priceRange: Math.max(...result.rows.map(r => parseFloat(r.final_price))) - Math.min(...result.rows.map(r => parseFloat(r.final_price))),
        retailerCount: result.rows.length,
        averageDiscount: result.rows.reduce((sum, r) => sum + (r.discount_percentage || 0), 0) / result.rows.length
      }
    };

    // Cache for 10 minutes
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(comparison));
    }

    res.json(comparison);

  } catch (error) {
    logger.error('Error fetching price comparison:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch price comparison'
    });
  }
});

// Get spirits available in a specific Indian state
router.get('/state/:stateCode', async (req, res) => {
  try {
    const { stateCode } = req.params;
    const { category, manufacturer, priceRange } = req.query;

    // Validate state code
    if (!stateCode || stateCode.length !== 2) {
      return res.status(400).json({
        error: 'Invalid state code',
        message: 'State code must be 2 characters'
      });
    }

    // Check cache
    const redisClient = getRedisClient();
    const cacheKey = `pricing:state:${stateCode}:${category || 'all'}:${manufacturer || 'all'}:${priceRange || 'all'}`;
    
    if (redisClient && redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
    }

    // Get spirits by state using database function
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM get_spirits_by_state($1)',
      [stateCode]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No spirits found',
        message: `No spirits available in state ${stateCode}`
      });
    }

    // Filter by category if specified
    let filteredSpirits = result.rows;
    if (category) {
      filteredSpirits = filteredSpirits.filter(s => s.category === category);
    }

    // Filter by manufacturer if specified
    if (manufacturer) {
      filteredSpirits = filteredSpirits.filter(s => s.manufacturer === manufacturer);
    }

    // Filter by price range if specified
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseFloat(p));
      if (!isNaN(min) && !isNaN(max)) {
        filteredSpirits = filteredSpirits.filter(s => s.mrp >= min && s.mrp <= max);
      }
    }

    // Get state information
    const stateClient = await pool.connect();
    const stateResult = await stateClient.query(
      'SELECT * FROM states WHERE code = $1',
      [stateCode]
    );
    stateClient.release();

    const state = stateResult.rows[0];

    const response = {
      state: {
        code: stateCode,
        name: state.name,
        dryState: state.dry_state,
        onlineDeliveryAllowed: state.online_delivery_allowed,
        homeDeliveryAllowed: state.home_delivery_allowed,
        maxQuantityPerPerson: state.max_quantity_per_person
      },
      spirits: filteredSpirits.map(spirit => ({
        id: spirit.spirit_id,
        name: spirit.spirit_name,
        brand: spirit.brand,
        type: spirit.type,
        manufacturer: spirit.manufacturer,
        mrp: spirit.mrp,
        availableRetailers: spirit.available_retailers
      })),
      totalSpirits: filteredSpirits.length,
      filters: {
        category: category || 'all',
        manufacturer: manufacturer || 'all',
        priceRange: priceRange || 'all'
      }
    };

    // Cache for 15 minutes
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(cacheKey, 900, JSON.stringify(response));
    }

    res.json(response);

  } catch (error) {
    logger.error('Error fetching spirits by state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch spirits by state'
    });
  }
});

// Get festival pricing for Indian spirits
router.get('/festival/:spiritId/:stateCode/:festivalName', async (req, res) => {
  try {
    const { spiritId, stateCode, festivalName } = req.params;

    // Validate parameters
    if (!spiritId || isNaN(spiritId)) {
      return res.status(400).json({
        error: 'Invalid spirit ID',
        message: 'Spirit ID must be a valid number'
      });
    }

    if (!stateCode || stateCode.length !== 2) {
      return res.status(400).json({
        error: 'Invalid state code',
        message: 'State code must be 2 characters'
      });
    }

    // Get festival pricing using database function
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM get_festival_pricing($1, (SELECT id FROM states WHERE code = $2), $3)',
      [spiritId, stateCode, festivalName]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No festival pricing found',
        message: `No festival pricing available for spirit ID ${spiritId} in state ${stateCode} for ${festivalName}`
      });
    }

    // Get spirit and state information
    const infoClient = await pool.connect();
    const infoResult = await infoClient.query(`
      SELECT 
        sp.name as spirit_name, 
        sp.brand as spirit_brand,
        sp.manufacturer,
        s.name as state_name
      FROM spirits sp, states s 
      WHERE sp.id = $1 AND s.code = $2
    `, [spiritId, stateCode]);
    infoClient.release();

    if (infoResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Spirit or state not found',
        message: `No information found for spirit ID ${spiritId} in state ${stateCode}`
      });
    }

    const spirit = infoResult.rows[0];
    const festivalPricing = result.rows[0];

    const response = {
      spirit: {
        id: parseInt(spiritId),
        name: spirit.spirit_name,
        brand: spirit.spirit_brand,
        manufacturer: spirit.manufacturer
      },
      state: {
        code: stateCode,
        name: spirit.state_name
      },
      festival: {
        name: festivalPricing.festival_name,
        discountPercentage: parseFloat(festivalPricing.discount_percentage),
        specialPrice: festivalPricing.special_price ? parseFloat(festivalPricing.special_price) : null,
        startDate: festivalPricing.start_date,
        endDate: festivalPricing.end_date,
        isActive: new Date() >= new Date(festivalPricing.start_date) && new Date() <= new Date(festivalPricing.end_date)
      }
    };

    res.json(response);

  } catch (error) {
    logger.error('Error fetching festival pricing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch festival pricing'
    });
  }
});

// Get price history for a specific spirit and state
router.get('/history/:spiritId/:stateCode', async (req, res) => {
  try {
    const { spiritId, stateCode } = req.params;
    const { days = 30, retailer } = req.query;

    // Validate parameters
    if (!spiritId || isNaN(spiritId)) {
      return res.status(400).json({
        error: 'Invalid spirit ID',
        message: 'Spirit ID must be a valid number'
      });
    }

    if (!stateCode || stateCode.length !== 2) {
      return res.status(400).json({
        error: 'Invalid state code',
        message: 'State code must be 2 characters'
      });
    }

    if (days < 1 || days > 365) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 365'
      });
    }

    // Build query
    let query = `
      SELECT 
        ph.old_price,
        ph.new_price,
        ph.price_change,
        ph.change_percentage,
        ph.change_reason,
        ph.recorded_at,
        r.name as retailer_name,
        p.base_price,
        p.final_price,
        p.mrp_price
      FROM price_history ph
      JOIN prices p ON ph.price_id = p.id
      JOIN retailers r ON p.retailer_id = r.id
      JOIN states s ON p.state_id = s.id
      WHERE p.spirit_id = $1 
      AND s.code = $2
      AND ph.recorded_at > NOW() - INTERVAL '${days} days'
    `;

    const queryParams = [spiritId, stateCode];

    if (retailer) {
      query += ` AND r.id = $3`;
      queryParams.push(retailer);
    }

    query += ` ORDER BY ph.recorded_at DESC`;

    const client = await pool.connect();
    const result = await client.query(query, queryParams);
    client.release();

    // Get spirit and state information
    const infoClient = await pool.connect();
    const infoResult = await infoClient.query(`
      SELECT 
        sp.name as spirit_name, 
        sp.brand as spirit_brand,
        s.name as state_name
      FROM spirits sp, states s 
      WHERE sp.id = $1 AND s.code = $2
    `, [spiritId, stateCode]);
    infoClient.release();

    if (infoResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Spirit or state not found',
        message: `No information found for spirit ID ${spiritId} in state ${stateCode}`
      });
    }

    const spirit = infoResult.rows[0];

    // Format history data
    const history = {
      spirit: {
        id: parseInt(spiritId),
        name: spirit.spirit_name,
        brand: spirit.spirit_brand
      },
      state: {
        code: stateCode,
        name: spirit.state_name
      },
      period: `${days} days`,
      history: result.rows.map(row => ({
        oldPrice: parseFloat(row.old_price),
        newPrice: parseFloat(row.new_price),
        change: parseFloat(row.price_change),
        changePercentage: parseFloat(row.change_percentage),
        reason: row.change_reason,
        retailer: row.retailer_name,
        mrpPrice: row.mrp_price ? parseFloat(row.mrp_price) : null,
        recordedAt: row.recorded_at
      })),
      summary: {
        totalChanges: result.rows.length,
        averageChange: result.rows.length > 0 
          ? result.rows.reduce((sum, r) => sum + parseFloat(r.price_change), 0) / result.rows.length 
          : 0,
        largestIncrease: result.rows.length > 0 
          ? Math.max(...result.rows.map(r => parseFloat(r.price_change))) 
          : 0,
        largestDecrease: result.rows.length > 0 
          ? Math.min(...result.rows.map(r => parseFloat(r.price_change))) 
          : 0
      }
    };

    res.json(history);

  } catch (error) {
    logger.error('Error fetching price history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch price history'
    });
  }
});

// Get price alerts (significant price changes)
router.get('/alerts', async (req, res) => {
  try {
    const { threshold = 10, days = 7 } = req.query; // threshold in percentage

    // Validate parameters
    if (threshold < 1 || threshold > 100) {
      return res.status(400).json({
        error: 'Invalid threshold parameter',
        message: 'Threshold must be between 1 and 100'
      });
    }

    if (days < 1 || days > 30) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 30'
      });
    }

    // Get significant price changes
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        ph.price_id,
        ph.old_price,
        ph.new_price,
        ph.price_change,
        ph.change_percentage,
        ph.recorded_at,
        p.spirit_id,
        p.state_id,
        p.mrp_price,
        sp.name as spirit_name,
        sp.brand as spirit_brand,
        sp.manufacturer,
        s.name as state_name,
        s.code as state_code,
        r.name as retailer_name
      FROM price_history ph
      JOIN prices p ON ph.price_id = p.id
      JOIN spirits sp ON p.spirit_id = sp.id
      JOIN states s ON p.state_id = s.id
      JOIN retailers r ON p.retailer_id = r.id
      WHERE ABS(ph.change_percentage) >= $1
      AND ph.recorded_at > NOW() - INTERVAL '${days} days'
      ORDER BY ABS(ph.change_percentage) DESC, ph.recorded_at DESC
      LIMIT 50
    `, [threshold]);
    client.release();

    const alerts = result.rows.map(row => ({
      id: row.price_id,
      spirit: {
        id: row.spirit_id,
        name: row.spirit_name,
        brand: row.spirit_brand,
        manufacturer: row.manufacturer
      },
      state: {
        id: row.state_id,
        name: row.state_name,
        code: row.state_code
      },
      retailer: row.retailer_name,
      oldPrice: parseFloat(row.old_price),
      newPrice: parseFloat(row.new_price),
      change: parseFloat(row.price_change),
      changePercentage: parseFloat(row.change_percentage),
      mrpPrice: row.mrp_price ? parseFloat(row.mrp_price) : null,
      isIncrease: parseFloat(row.change_percentage) > 0,
      recordedAt: row.recorded_at
    }));

    const response = {
      threshold: `${threshold}%`,
      period: `${days} days`,
      totalAlerts: alerts.length,
      alerts: alerts,
      summary: {
        increases: alerts.filter(a => a.isIncrease).length,
        decreases: alerts.filter(a => !a.isIncrease).length,
        averageChange: alerts.length > 0 
          ? alerts.reduce((sum, a) => sum + Math.abs(a.changePercentage), 0) / alerts.length 
          : 0
      }
    };

    res.json(response);

  } catch (error) {
    logger.error('Error fetching price alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch price alerts'
    });
  }
});

// Get pricing statistics for Indian market
router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get various statistics
    const [
      totalPrices,
      totalSpirits,
      totalStates,
      totalRetailers,
      recentUpdates,
      priceChanges,
      indianBrands,
      dryStates
    ] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM prices'),
      client.query('SELECT COUNT(*) as count FROM spirits'),
      client.query('SELECT COUNT(*) as count FROM states'),
      client.query('SELECT COUNT(*) as count FROM retailers WHERE is_active = true'),
      client.query('SELECT COUNT(*) as count FROM prices WHERE scraped_at > NOW() - INTERVAL \'24 hours\''),
      client.query('SELECT COUNT(*) as count FROM price_history WHERE recorded_at > NOW() - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as count FROM spirits WHERE is_indian_brand = true'),
      client.query('SELECT COUNT(*) as count FROM states WHERE dry_state = true')
    ]);

    client.release();

    const stats = {
      overview: {
        totalPrices: parseInt(totalPrices.rows[0].count),
        totalSpirits: parseInt(totalSpirits.rows[0].count),
        totalStates: parseInt(totalStates.rows[0].count),
        totalRetailers: parseInt(totalRetailers.rows[0].count),
        indianBrands: parseInt(indianBrands.rows[0].count),
        dryStates: parseInt(dryStates.rows[0].count)
      },
      recent: {
        pricesUpdated24h: parseInt(recentUpdates.rows[0].count),
        priceChanges7d: parseInt(priceChanges.rows[0].count)
      },
      timestamp: new Date().toISOString()
    };

    res.json(stats);

  } catch (error) {
    logger.error('Error fetching pricing statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch pricing statistics'
    });
  }
});

module.exports = router;
