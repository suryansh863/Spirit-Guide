const BaseScraper = require('../base-scraper');
const { pool } = require('../../database/connection');
const logger = require('../../utils/logger');

class WineAndMoreScraper extends BaseScraper {
  constructor() {
    super(1, { // retailerId = 1 for Wine & More
      delay: 3000,
      timeout: 45000,
      maxRetries: 2
    });
    
    this.retailerName = 'Wine & More';
    this.baseUrl = 'https://wineandmore.com';
    this.logger = logger.createComponentLogger('WineAndMoreScraper');
  }

  // Main scraping method
  async scrape() {
    try {
      this.logger.info('Starting Wine & More scraping session');
      
      if (!await this.initialize()) {
        throw new Error('Failed to initialize scraper');
      }

      // Get retailer configuration
      const config = await this.getRetailerConfig();
      if (!config) {
        throw new Error('Failed to get retailer configuration');
      }

      // Get products to scrape
      const products = await this.getProductsToScrape();
      this.logger.info(`Found ${products.length} products to scrape`);

      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          const result = await this.scrapeProduct(product, config);
          if (result) {
            successCount++;
            this.logger.info(`Successfully scraped: ${product.name}`);
          }
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to scrape ${product.name}:`, error);
          
          // Take screenshot for debugging
          await this.takeScreenshot(`wine_and_more_error_${product.id}`);
        }

        // Delay between products
        await this.delay(this.options.delay);
      }

      this.logger.info(`Scraping completed. Success: ${successCount}, Errors: ${errorCount}`);
      
      // Update retailer statistics
      await this.updateRetailerStats(successCount, errorCount);
      
      return { successCount, errorCount };
    } catch (error) {
      this.logger.error('Scraping session failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  // Get retailer configuration from database
  async getRetailerConfig() {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM retailers WHERE id = $1',
        [this.retailerId]
      );
      client.release();

      if (result.rows.length === 0) {
        throw new Error('Retailer not found');
      }

      return result.rows[0];
    } catch (error) {
      this.logger.error('Failed to get retailer config:', error);
      return null;
    }
  }

  // Get products that need price updates
  async getProductsToScrape() {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT DISTINCT s.id, s.name, s.brand, s.type
        FROM spirits s
        WHERE s.id IN (
          SELECT DISTINCT spirit_id 
          FROM prices 
          WHERE retailer_id = $1 
          AND scraped_at < NOW() - INTERVAL '24 hours'
        )
        OR s.id NOT IN (
          SELECT DISTINCT spirit_id 
          FROM prices 
          WHERE retailer_id = $1
        )
        LIMIT 50
      `, [this.retailerId]);
      client.release();

      return result.rows;
    } catch (error) {
      this.logger.error('Failed to get products to scrape:', error);
      return [];
    }
  }

  // Scrape individual product
  async scrapeProduct(product, config) {
    try {
      // Construct search URL
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(product.name)}`;
      
      // Navigate to search page
      if (!await this.navigateTo(searchUrl)) {
        throw new Error('Failed to navigate to search page');
      }

      // Wait for search results
      await this.waitForElement(config.scraping_config.selectors.product_name, 15000);
      
      // Extract product data
      const productData = await this.extractProductData(config.scraping_config.selectors);
      
      if (productData) {
        // Save price data to database
        await this.savePriceData(product.id, productData);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to scrape product ${product.name}:`, error);
      return false;
    }
  }

  // Extract product data from page
  async extractProductData(selectors) {
    try {
      const productName = await this.extractText(selectors.product_name);
      const priceText = await this.extractText(selectors.price);
      const availabilityText = await this.extractText(selectors.availability);

      if (!productName || !priceText) {
        this.logger.warn('Required product data not found');
        return null;
      }

      const price = this.extractPrice(priceText);
      const availability = this.determineAvailability(availabilityText);

      return {
        name: productName,
        price: price,
        availability: availability,
        scrapedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to extract product data:', error);
      return null;
    }
  }

  // Determine availability status
  determineAvailability(availabilityText) {
    if (!availabilityText) return 'unknown';
    
    const text = availabilityText.toLowerCase();
    if (text.includes('in stock') || text.includes('available')) {
      return 'available';
    } else if (text.includes('out of stock') || text.includes('unavailable')) {
      return 'out_of_stock';
    } else if (text.includes('pre-order') || text.includes('coming soon')) {
      return 'pre_order';
    }
    
    return 'unknown';
  }

  // Save price data to database
  async savePriceData(spiritId, productData) {
    try {
      const client = await pool.connect();
      
      // Get all states for this product
      const statesResult = await client.query('SELECT id, excise_tax_rate, sales_tax_rate FROM states');
      
      for (const state of statesResult.rows) {
        // Calculate final price with taxes
        const basePrice = productData.price;
        const exciseTax = basePrice * state.excise_tax_rate;
        const salesTax = basePrice * state.sales_tax_rate;
        const finalPrice = basePrice + exciseTax + salesTax;
        
        // Check if price record exists
        const existingPrice = await client.query(
          'SELECT id, final_price FROM prices WHERE spirit_id = $1 AND state_id = $2 AND retailer_id = $3',
          [spiritId, state.id, this.retailerId]
        );

        if (existingPrice.rows.length > 0) {
          const oldPrice = existingPrice.rows[0].final_price;
          const priceChange = finalPrice - oldPrice;
          const changePercentage = ((priceChange / oldPrice) * 100);

          // Update existing price
          await client.query(`
            UPDATE prices 
            SET base_price = $1, final_price = $2, tax_amount = $3, 
                availability_status = $4, scraped_at = $5, updated_at = CURRENT_TIMESTAMP
            WHERE spirit_id = $6 AND state_id = $7 AND retailer_id = $8
          `, [
            basePrice, finalPrice, exciseTax + salesTax, 
            productData.availability, productData.scrapedAt,
            spiritId, state.id, this.retailerId
          ]);

          // Record price history if there's a change
          if (Math.abs(priceChange) > 0.01) { // More than 1 cent change
            await client.query(`
              INSERT INTO price_history (price_id, old_price, new_price, price_change, change_percentage)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              existingPrice.rows[0].id, oldPrice, finalPrice, priceChange, changePercentage
            ]);

            this.logger.priceUpdate(
              `Price updated for ${productData.name} in state ${state.id}`,
              productData.name,
              state.id,
              { oldPrice, newPrice: finalPrice, change: priceChange }
            );
          }
        } else {
          // Insert new price record
          await client.query(`
            INSERT INTO prices (spirit_id, state_id, retailer_id, base_price, final_price, 
                              tax_amount, availability_status, scraped_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            spiritId, state.id, this.retailerId, basePrice, finalPrice,
            exciseTax + salesTax, productData.availability, productData.scrapedAt
          ]);
        }
      }

      client.release();
      this.logger.info(`Price data saved for spirit ${spiritId}`);
    } catch (error) {
      this.logger.error('Failed to save price data:', error);
      throw error;
    }
  }

  // Update retailer statistics
  async updateRetailerStats(successCount, errorCount) {
    try {
      const totalAttempts = successCount + errorCount;
      const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0;

      const client = await pool.connect();
      await client.query(`
        UPDATE retailers 
        SET success_rate = $1, last_scraped_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [successRate, this.retailerId]);
      client.release();

      this.logger.info(`Retailer stats updated. Success rate: ${successRate.toFixed(2)}%`);
    } catch (error) {
      this.logger.error('Failed to update retailer stats:', error);
    }
  }
}

module.exports = WineAndMoreScraper;
