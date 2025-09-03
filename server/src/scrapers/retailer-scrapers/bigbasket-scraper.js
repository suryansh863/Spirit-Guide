const BaseScraper = require('../base-scraper');
const { pool } = require('../../database/connection');
const logger = require('../../utils/logger');

class BigBasketScraper extends BaseScraper {
  constructor() {
    super(1, { // retailerId = 1 for BigBasket
      delay: 3000,
      timeout: 45000,
      maxRetries: 2
    });
    
    this.retailerName = 'BigBasket';
    this.baseUrl = 'https://www.bigbasket.com';
    this.logger = logger.createComponentLogger('BigBasketScraper');
  }

  // Main scraping method
  async scrape() {
    try {
      this.logger.info('Starting BigBasket scraping session');
      
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
          await this.takeScreenshot(`bigbasket_error_${product.id}`);
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
        'SELECT * FROM retailers WHERE name = $1',
        [this.retailerName]
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
        SELECT DISTINCT s.id, s.name, s.brand, s.type, s.manufacturer, s.mrp
        FROM spirits s
        WHERE s.id IN (
          SELECT DISTINCT spirit_id 
          FROM prices 
          WHERE retailer_id = (SELECT id FROM retailers WHERE name = $1)
          AND scraped_at < NOW() - INTERVAL '24 hours'
        )
        OR s.id NOT IN (
          SELECT DISTINCT spirit_id 
          FROM prices 
          WHERE retailer_id = (SELECT id FROM retailers WHERE name = $1)
        )
        AND s.is_indian_brand = true
        LIMIT 50
      `, [this.retailerName]);
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
      // Construct search URL for BigBasket
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

  // Extract product data from BigBasket page
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
      
      // Extract delivery charges (BigBasket specific)
      const deliveryCharges = await this.extractDeliveryCharges();
      
      // Extract minimum order amount
      const minimumOrderAmount = await this.extractMinimumOrderAmount();

      return {
        name: productName,
        price: price,
        availability: availability,
        deliveryCharges: deliveryCharges,
        minimumOrderAmount: minimumOrderAmount,
        scrapedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to extract product data:', error);
      return null;
    }
  }

  // Extract delivery charges from BigBasket
  async extractDeliveryCharges() {
    try {
      // Look for delivery charge information
      const deliverySelector = '.delivery-charges, .delivery-fee, [data-testid="delivery-charges"]';
      const deliveryText = await this.extractText(deliverySelector);
      
      if (deliveryText) {
        const chargeMatch = deliveryText.match(/₹?\s*(\d+(?:\.\d{2})?)/);
        if (chargeMatch) {
          return parseFloat(chargeMatch[1]);
        }
      }
      
      // Default delivery charges for BigBasket
      return 40.00; // Standard delivery charge
    } catch (error) {
      this.logger.warn('Failed to extract delivery charges, using default');
      return 40.00;
    }
  }

  // Extract minimum order amount from BigBasket
  async extractMinimumOrderAmount() {
    try {
      // Look for minimum order information
      const minOrderSelector = '.min-order, .minimum-order, [data-testid="min-order"]';
      const minOrderText = await this.extractText(minOrderSelector);
      
      if (minOrderText) {
        const amountMatch = minOrderText.match(/₹?\s*(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
          return parseFloat(amountMatch[1]);
        }
      }
      
      // Default minimum order for BigBasket
      return 500.00; // Standard minimum order
    } catch (error) {
      this.logger.warn('Failed to extract minimum order amount, using default');
      return 500.00;
    }
  }

  // Determine availability status for Indian market
  determineAvailability(availabilityText) {
    if (!availabilityText) return 'unknown';
    
    const text = availabilityText.toLowerCase();
    if (text.includes('in stock') || text.includes('available') || text.includes('add to basket')) {
      return 'available';
    } else if (text.includes('out of stock') || text.includes('unavailable') || text.includes('sold out')) {
      return 'out_of_stock';
    } else if (text.includes('pre-order') || text.includes('coming soon') || text.includes('back order')) {
      return 'pre_order';
    }
    
    return 'unknown';
  }

  // Save price data to database with Indian market specifics
  async savePriceData(spiritId, productData) {
    try {
      const client = await pool.connect();
      
      // Get all states where BigBasket operates
      const statesResult = await client.query(`
        SELECT id, excise_tax_rate, sales_tax_rate, dry_state, online_delivery_allowed
        FROM states 
        WHERE code = ANY(
          SELECT unnest(operating_states) 
          FROM retailers 
          WHERE name = $1
        )
      `, [this.retailerName]);
      
      for (const state of statesResult.rows) {
        // Skip dry states
        if (state.dry_state) {
          continue;
        }
        
        // Skip states where online delivery is not allowed
        if (!state.online_delivery_allowed) {
          continue;
        }
        
        // Calculate final price with Indian taxes
        const basePrice = productData.price;
        const exciseTax = basePrice * state.excise_tax_rate;
        const salesTax = basePrice * state.sales_tax_rate;
        const finalPrice = basePrice + exciseTax + salesTax + (productData.deliveryCharges || 0);
        
        // Check if price record exists
        const existingPrice = await client.query(
          'SELECT id, final_price FROM prices WHERE spirit_id = $1 AND state_id = $2 AND retailer_id = (SELECT id FROM retailers WHERE name = $3)',
          [spiritId, state.id, this.retailerName]
        );

        if (existingPrice.rows.length > 0) {
          const oldPrice = existingPrice.rows[0].final_price;
          const priceChange = finalPrice - oldPrice;
          const changePercentage = ((priceChange / oldPrice) * 100);

          // Update existing price
          await client.query(`
            UPDATE prices 
            SET base_price = $1, final_price = $2, tax_amount = $3, 
                delivery_charges = $4, minimum_order_amount = $5,
                availability_status = $6, scraped_at = $7, updated_at = CURRENT_TIMESTAMP
            WHERE spirit_id = $8 AND state_id = $9 AND retailer_id = (SELECT id FROM retailers WHERE name = $10)
          `, [
            basePrice, finalPrice, exciseTax + salesTax, 
            productData.deliveryCharges, productData.minimumOrderAmount,
            productData.availability, productData.scrapedAt,
            spiritId, state.id, this.retailerName
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
                              tax_amount, delivery_charges, minimum_order_amount, availability_status, scraped_at)
            VALUES ($1, $2, (SELECT id FROM retailers WHERE name = $3), $4, $5, $6, $7, $8, $9)
          `, [
            spiritId, state.id, this.retailerName, basePrice, finalPrice,
            exciseTax + salesTax, productData.deliveryCharges, productData.minimumOrderAmount, 
            productData.availability, productData.scrapedAt
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
        WHERE name = $2
      `, [successRate, this.retailerName]);
      client.release();

      this.logger.info(`Retailer stats updated. Success rate: ${successRate.toFixed(2)}%`);
    } catch (error) {
      this.logger.error('Failed to update retailer stats:', error);
    }
  }
}

module.exports = BigBasketScraper;
