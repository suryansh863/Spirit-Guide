require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initializeRedis, testConnection } = require('./database/connection');
const CronScheduler = require('./cron');
const logger = require('./utils/logger');

// Import routes
const pricingRoutes = require('./routes/pricing');
const retailerRoutes = require('./routes/retailers');
const spiritsRoutes = require('./routes/spirits');
const statesRoutes = require('./routes/states');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cron scheduler
let cronScheduler = null;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

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

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await testConnection();
    const redisHealthy = await initializeRedis();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        cron: cronScheduler ? 'running' : 'stopped'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: require('../package.json').version
    };

    const overallHealth = dbHealthy && redisHealthy;
    res.status(overallHealth ? 200 : 503).json(healthStatus);
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

// Add drinks routes as aliases for spirits
app.use('/api/drinks', spiritsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Spirit Guide Pricing System API',
    version: require('../package.json').version,
    status: 'running',
    endpoints: {
      health: '/health',
      pricing: '/api/pricing',
      retailers: '/api/retailers',
      spirits: '/api/spirits',
      states: '/api/states',
      admin: '/api/admin'
    },
    documentation: '/api/docs'
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
  
  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(error.status || 500).json({
    error: isProduction ? 'Internal server error' : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop cron scheduler
    if (cronScheduler) {
      cronScheduler.stop();
    }
    
    // Force exit after 5 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Initialize and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    logger.info('Database connection established');

    // Initialize Redis
    const redisConnected = await initializeRedis();
    if (redisConnected) {
      logger.info('Redis connection established');
    } else {
      logger.warn('Redis connection failed, continuing without Redis');
    }

    // Initialize cron scheduler
    cronScheduler = new CronScheduler();
    await cronScheduler.initialize();
    logger.info('Cron scheduler initialized');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Spirit Guide Pricing System running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
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
