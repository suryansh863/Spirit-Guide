require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('express-rate-limit');
const { testConnection } = require('./src/database/connection');
const logger = require('./src/utils/logger');

// Import routes
const pricingRoutes = require('./src/routes/pricing');
const retailerRoutes = require('./src/routes/retailers');
const spiritsRoutes = require('./src/routes/spirits');
const statesRoutes = require('./src/routes/states');
const adminRoutes = require('./src/routes/admin');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await testConnection();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: 'disabled',
        cron: 'disabled'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: require('./package.json').version
    };

    res.status(dbHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/pricing', pricingRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/spirits', spiritsRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Spirit Guide Pricing System API (Simplified)',
    version: require('./package.json').version,
    status: 'running',
    endpoints: {
      health: '/health',
      pricing: '/api/pricing',
      retailers: '/api/retailers',
      spirits: '/api/spirits',
      states: '/api/states',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(error.status || 500).json({
    error: isProduction ? 'Internal server error' : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    logger.info('Database connection established');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Spirit Guide Pricing System (Simplified) running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Frontend: http://localhost:5173`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
