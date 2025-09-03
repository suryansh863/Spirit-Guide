const { Pool } = require('pg');
const Redis = require('redis');
const logger = require('../utils/logger');

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'spirit_guide_pricing',
  user: process.env.DB_USER || 'yashswisingh',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Redis Client
let redisClient = null;

// Initialize Redis connection
const initializeRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    return null;
  }
};

// Database connection test
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
const closeConnections = async () => {
  try {
    await pool.end();
    if (redisClient) {
      await redisClient.quit();
    }
    logger.info('Database connections closed gracefully');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
};

// Process termination handlers
process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);

// Health check function
const healthCheck = async () => {
  const dbHealthy = await testConnection();
  const redisHealthy = redisClient && redisClient.isReady;
  
  return {
    database: dbHealthy,
    redis: redisHealthy,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  pool,
  initializeRedis,
  testConnection,
  closeConnections,
  healthCheck,
  getRedisClient: () => redisClient,
};
