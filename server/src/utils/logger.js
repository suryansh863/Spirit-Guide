const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'spirit-guide-pricing' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write scraping-specific logs to scraping.log
    new winston.transports.File({
      filename: path.join(logsDir, 'scraping.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, retailer, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [${retailer || 'SYSTEM'}]: ${message}`;
        })
      )
    }),
    
    // Write price update logs to price-updates.log
    new winston.transports.File({
      filename: path.join(logsDir, 'price-updates.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, spirit, state, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [${spirit || 'SYSTEM'}] [${state || 'ALL'}]: ${message}`;
        })
      )
    })
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create specialized loggers for different components
const createComponentLogger = (component) => {
  return {
    info: (message, meta = {}) => logger.info(message, { ...meta, component }),
    error: (message, meta = {}) => logger.error(message, { ...meta, component }),
    warn: (message, meta = {}) => logger.warn(message, { ...meta, component }),
    debug: (message, meta = {}) => logger.debug(message, { ...meta, component }),
    verbose: (message, meta = {}) => logger.verbose(message, { ...meta, component }),
    
    // Specialized logging methods
    scraping: (message, retailer, meta = {}) => {
      logger.info(message, { ...meta, component, retailer, logType: 'scraping' });
    },
    
    priceUpdate: (message, spirit, state, meta = {}) => {
      logger.info(message, { ...meta, component, spirit, state, logType: 'price-update' });
    },
    
    performance: (message, duration, meta = {}) => {
      logger.info(message, { ...meta, component, duration, logType: 'performance' });
    },
    
    security: (message, meta = {}) => {
      logger.warn(message, { ...meta, component, logType: 'security' });
    }
  };
};

// Export main logger and component logger factory
module.exports = {
  logger,
  createComponentLogger,
  
  // Convenience methods
  info: (message, meta) => logger.info(message, meta),
  error: (message, meta) => logger.error(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
  verbose: (message, meta) => logger.verbose(message, meta),
  
  // Specialized logging
  scraping: (message, retailer, meta) => {
    logger.info(message, { ...meta, retailer, logType: 'scraping' });
  },
  
  priceUpdate: (message, spirit, state, meta) => {
    logger.info(message, { ...meta, spirit, state, logType: 'price-update' });
  },
  
  performance: (message, duration, meta) => {
    logger.info(message, { ...meta, duration, logType: 'performance' });
  },
  
  security: (message, meta) => {
    logger.warn(message, { ...meta, logType: 'security' });
  }
};
