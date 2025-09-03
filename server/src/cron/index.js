const cron = require('node-cron');
const { pool, initializeRedis } = require('../database/connection');
const logger = require('../utils/logger');
const BigBasketScraper = require('../scrapers/retailer-scrapers/bigbasket-scraper');

class CronScheduler {
  constructor() {
    this.logger = logger.createComponentLogger('CronScheduler');
    this.isRunning = false;
    this.jobs = new Map();
  }

  // Initialize the cron scheduler
  async initialize() {
    try {
      this.logger.info('Initializing cron scheduler');
      
      // Try to initialize Redis (optional)
      try {
        await initializeRedis();
        this.logger.info('Redis initialized for cron scheduler');
      } catch (error) {
        this.logger.warn('Redis initialization failed, continuing without Redis:', error.message);
      }
      
      // Schedule all jobs
      this.schedulePriceUpdates();
      this.scheduleDatabaseBackup();
      this.scheduleSystemCleanup();
      this.scheduleHealthChecks();
      
      this.logger.info('Indian market cron scheduler initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize cron scheduler:', error);
      throw error;
    }
  }

  // Schedule daily price updates
  schedulePriceUpdates() {
    const cronExpression = process.env.PRICE_UPDATE_CRON || '0 2 * * *'; // Daily at 2 AM
    
    const job = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        this.logger.warn('Price update already running, skipping...');
        return;
      }
      
      this.isRunning = true;
      this.logger.info('Starting scheduled Indian market price update');
      
      try {
        await this.runPriceUpdates();
        this.logger.info('Scheduled Indian market price update completed successfully');
      } catch (error) {
        this.logger.error('Scheduled Indian market price update failed:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata' // Indian timezone
    });

    this.jobs.set('priceUpdates', job);
    this.logger.info(`Price updates scheduled: ${cronExpression}`);
  }

  // Schedule weekly database backup
  scheduleDatabaseBackup() {
    const cronExpression = process.env.BACKUP_CRON || '0 3 * * 0'; // Weekly on Sunday at 3 AM
    
    const job = cron.schedule(cronExpression, async () => {
      this.logger.info('Starting scheduled database backup');
      
      try {
        await this.runDatabaseBackup();
        this.logger.info('Scheduled database backup completed successfully');
      } catch (error) {
        this.logger.error('Scheduled database backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('databaseBackup', job);
    this.logger.info(`Database backup scheduled: ${cronExpression}`);
  }

  // Schedule daily system cleanup
  scheduleSystemCleanup() {
    const cronExpression = process.env.CLEANUP_CRON || '0 4 * * *'; // Daily at 4 AM
    
    const job = cron.schedule(cronExpression, async () => {
      this.logger.info('Starting scheduled system cleanup');
      
      try {
        await this.runSystemCleanup();
        this.logger.info('Scheduled system cleanup completed successfully');
      } catch (error) {
        this.logger.error('Scheduled system cleanup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('systemCleanup', job);
    this.logger.info(`System cleanup scheduled: ${cronExpression}`);
  }

  // Schedule health checks every 30 minutes
  scheduleHealthChecks() {
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        await this.runHealthCheck();
      } catch (error) {
        this.logger.error('Health check failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('healthChecks', job);
    this.logger.info('Health checks scheduled: every 30 minutes');
  }

  // Run price updates for all Indian retailers
  async runPriceUpdates() {
    try {
      this.logger.info('Starting Indian market price update process');
      const startTime = Date.now();

      // Get all active retailers
      const retailers = await this.getActiveRetailers();
      this.logger.info(`Found ${retailers.length} active retailers`);

      let totalSuccess = 0;
      let totalErrors = 0;

      for (const retailer of retailers) {
        try {
          this.logger.info(`Starting price update for retailer: ${retailer.name}`);
          
          // Create appropriate scraper based on retailer
          const scraper = this.createScraper(retailer);
          if (scraper) {
            const result = await scraper.scrape();
            totalSuccess += result.successCount;
            totalErrors += result.errorCount;
            
            this.logger.info(`Retailer ${retailer.name} completed: ${result.successCount} success, ${result.errorCount} errors`);
          }
        } catch (error) {
          totalErrors++;
          this.logger.error(`Failed to update prices for retailer ${retailer.name}:`, error);
        }

        // Delay between retailers
        await this.delay(10000); // 10 seconds
      }

      const duration = Date.now() - startTime;
      this.logger.performance(`Indian market price update process completed`, duration, {
        totalSuccess,
        totalErrors,
        duration: `${duration}ms`
      });

      // Log scraping session
      await this.logScrapingSession(totalSuccess, totalErrors, duration);

    } catch (error) {
      this.logger.error('Price update process failed:', error);
      throw error;
    }
  }

  // Get active retailers from database
  async getActiveRetailers() {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM retailers WHERE is_active = true ORDER BY last_scraped_at ASC NULLS FIRST'
      );
      client.release();
      return result.rows;
    } catch (error) {
      this.logger.error('Failed to get active retailers:', error);
      return [];
    }
  }

  // Create appropriate scraper for retailer
  createScraper(retailer) {
    try {
      switch (retailer.name) {
        case 'BigBasket':
          return new BigBasketScraper();
        case 'Swiggy Instamart':
          // TODO: Implement SwiggyScraper
          this.logger.warn(`Swiggy Instamart scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        case 'Living Liquidz':
          // TODO: Implement LivingLiquidzScraper
          this.logger.warn(`Living Liquidz scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        case 'HipBar':
          // TODO: Implement HipBarScraper
          this.logger.warn(`HipBar scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        case 'Wine Park':
          // TODO: Implement WineParkScraper
          this.logger.warn(`Wine Park scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        case 'Karnataka Wine Store':
          // TODO: Implement KarnatakaWineStoreScraper
          this.logger.warn(`Karnataka Wine Store scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        case 'Delhi Duty Free':
          // TODO: Implement DelhiDutyFreeScraper
          this.logger.warn(`Delhi Duty Free scraper not yet implemented for retailer: ${retailer.name}`);
          return null;
        default:
          this.logger.warn(`No scraper implemented for retailer: ${retailer.name}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create scraper for retailer ${retailer.name}:`, error);
      return null;
    }
  }

  // Run database backup
  async runDatabaseBackup() {
    try {
      this.logger.info('Starting database backup');
      
      // Create backup directory if it doesn't exist
      const backupDir = './backups';
      if (!require('fs').existsSync(backupDir)) {
        require('fs').mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `${backupDir}/spirit_guide_pricing_${timestamp}.sql`;
      
      // Run pg_dump command
      const { exec } = require('child_process');
      const command = `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'postgres'} -d ${process.env.DB_NAME || 'spirit_guide_pricing'} > ${backupFile}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.error('Database backup failed:', error);
          throw error;
        }
        
        this.logger.info(`Database backup completed: ${backupFile}`);
        
        // Clean up old backups (keep last 10)
        this.cleanupOldBackups(backupDir, 10);
      });
      
    } catch (error) {
      this.logger.error('Database backup failed:', error);
      throw error;
    }
  }

  // Clean up old backup files
  cleanupOldBackups(backupDir, keepCount) {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: `${backupDir}/${file}`,
          time: fs.statSync(`${backupDir}/${file}`).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Remove old files
      if (files.length > keepCount) {
        const filesToRemove = files.slice(keepCount);
        for (const file of filesToRemove) {
          fs.unlinkSync(file.path);
          this.logger.info(`Removed old backup: ${file.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old backups:', error);
    }
  }

  // Run system cleanup
  async runSystemCleanup() {
    try {
      this.logger.info('Starting system cleanup');
      
      // Clean up old scraping logs (older than 30 days)
      await this.cleanupOldLogs();
      
      // Clean up old price history (older than 1 year)
      await this.cleanupOldPriceHistory();
      
      // Update statistics
      await this.updateSystemStatistics();
      
      this.logger.info('System cleanup completed successfully');
    } catch (error) {
      this.logger.error('System cleanup failed:', error);
      throw error;
    }
  }

  // Clean up old logs
  async cleanupOldLogs() {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        DELETE FROM scraping_logs 
        WHERE created_at < NOW() - INTERVAL '30 days'
      `);
      client.release();
      
      this.logger.info(`Cleaned up ${result.rowCount} old log entries`);
    } catch (error) {
      this.logger.error('Failed to cleanup old logs:', error);
    }
  }

  // Clean up old price history
  async cleanupOldPriceHistory() {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        DELETE FROM price_history 
        WHERE recorded_at < NOW() - INTERVAL '1 year'
      `);
      client.release();
      
      this.logger.info(`Cleaned up ${result.rowCount} old price history entries`);
    } catch (error) {
      this.logger.error('Failed to cleanup old price history:', error);
    }
  }

  // Update system statistics
  async updateSystemStatistics() {
    try {
      const client = await pool.connect();
      
      // Update retailer success rates
      await client.query(`
        UPDATE retailers r 
        SET success_rate = (
          SELECT COALESCE(AVG(CASE WHEN status = 'success' THEN 100 ELSE 0 END), 0)
          FROM scraping_logs sl 
          WHERE sl.retailer_id = r.id 
          AND sl.created_at > NOW() - INTERVAL '7 days'
        )
        WHERE r.is_active = true
      `);
      
      client.release();
      this.logger.info('System statistics updated');
    } catch (error) {
      this.logger.error('Failed to update system statistics:', error);
    }
  }

  // Run health check
  async runHealthCheck() {
    try {
      const client = await pool.connect();
      
      // Check database connection
      await client.query('SELECT 1');
      
      // Check table sizes
      const tableSizes = await client.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);
      
      client.release();
      
      // Log health status
      this.logger.info('Health check passed', {
        database: 'healthy',
        tableCount: tableSizes.rows.length,
        largestTable: tableSizes.rows[0]?.tablename || 'none'
      });
      
    } catch (error) {
      this.logger.error('Health check failed:', error);
    }
  }

  // Log scraping session
  async logScrapingSession(successCount, errorCount, duration) {
    try {
      const client = await pool.connect();
      await client.query(`
        INSERT INTO scraping_logs (status, message, execution_time_ms, records_scraped, errors_count, started_at, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'completed',
        `Automated Indian market price update: ${successCount} success, ${errorCount} errors`,
        duration,
        successCount,
        errorCount,
        new Date(Date.now() - duration),
        new Date()
      ]);
      client.release();
    } catch (error) {
      this.logger.error('Failed to log scraping session:', error);
    }
  }

  // Delay function
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Stop all cron jobs
  stop() {
    this.logger.info('Stopping cron scheduler');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      this.logger.info(`Stopped job: ${name}`);
    }
    
    this.jobs.clear();
    this.logger.info('Cron scheduler stopped');
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }
}

module.exports = CronScheduler;
