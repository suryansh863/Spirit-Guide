const BigBasketScraper = require('./retailer-scrapers/bigbasket-scraper');
const SwiggyScraper = require('./retailer-scrapers/swiggy-scraper');
const LivingLiquidzScraper = require('./retailer-scrapers/living-liquidz-scraper');
const { pool } = require('../database/connection');
const logger = require('../utils/logger');

class ScraperManager {
  constructor() {
    this.scrapers = [
      new BigBasketScraper(),
      new SwiggyScraper(),
      new LivingLiquidzScraper()
    ];
    this.logger = logger.createComponentLogger('ScraperManager');
  }

  async runAllScrapers() {
    this.logger.info('Starting all scrapers...');
    
    const results = [];
    
    for (const scraper of this.scrapers) {
      try {
        this.logger.info(`Running ${scraper.constructor.name}...`);
        const result = await scraper.scrape();
        results.push({
          scraper: scraper.constructor.name,
          success: true,
          result
        });
        this.logger.info(`${scraper.constructor.name} completed successfully`);
      } catch (error) {
        this.logger.error(`${scraper.constructor.name} failed:`, error);
        results.push({
          scraper: scraper.constructor.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async generateSamplePricingData() {
    this.logger.info('Generating sample pricing data...');
    
    try {
      const client = await pool.connect();
      
      // Get some spirits and retailers
      const spiritsResult = await client.query('SELECT id, mrp FROM spirits LIMIT 10');
      const retailersResult = await client.query('SELECT id FROM retailers WHERE is_active = true LIMIT 5');
      const statesResult = await client.query('SELECT id FROM states LIMIT 10');
      
      if (spiritsResult.rows.length === 0 || retailersResult.rows.length === 0 || statesResult.rows.length === 0) {
        this.logger.warn('Not enough data to generate sample pricing');
        return;
      }
      
      const spirits = spiritsResult.rows;
      const retailers = retailersResult.rows;
      const states = statesResult.rows;
      
      let insertedCount = 0;
      
      // Generate sample pricing data
      for (const spirit of spirits) {
        for (const retailer of retailers) {
          for (const state of states) {
            // Skip dry states
            const stateCheck = await client.query('SELECT dry_state FROM states WHERE id = $1', [state.id]);
            if (stateCheck.rows[0]?.dry_state) continue;
            
            // Generate realistic pricing variations
            const basePrice = parseFloat(spirit.mrp);
            const discount = Math.random() * 0.3; // 0-30% discount
            const finalPrice = basePrice * (1 - discount);
            const taxRate = 0.15 + Math.random() * 0.1; // 15-25% tax
            const taxAmount = finalPrice * taxRate;
            
            // Check if pricing already exists
            const existingCheck = await client.query(
              'SELECT id FROM prices WHERE spirit_id = $1 AND retailer_id = $2 AND state_id = $3',
              [spirit.id, retailer.id, state.id]
            );
            
            if (existingCheck.rows.length === 0) {
              await client.query(`
                INSERT INTO prices (
                  spirit_id, retailer_id, state_id, base_price, final_price, 
                  tax_amount, mrp_price, discount_percentage, availability_status,
                  delivery_charges, minimum_order_amount, scraped_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
              `, [
                spirit.id, retailer.id, state.id, basePrice, finalPrice,
                taxAmount, basePrice, discount * 100, 'available',
                Math.random() * 50, Math.random() * 200
              ]);
              
              insertedCount++;
            }
          }
        }
      }
      
      client.release();
      this.logger.info(`Generated ${insertedCount} sample pricing records`);
      
    } catch (error) {
      this.logger.error('Failed to generate sample pricing data:', error);
    }
  }
}

// Main execution
async function main() {
  const manager = new ScraperManager();
  
  try {
    // First try to generate sample data if no pricing exists
    const pricingCheck = await pool.connect();
    const pricingCount = await pricingCheck.query('SELECT COUNT(*) as count FROM prices');
    pricingCheck.release();
    
    if (parseInt(pricingCount.rows[0].count) === 0) {
      console.log('No pricing data found. Generating sample data...');
      await manager.generateSamplePricingData();
    }
    
    // Run all scrapers
    console.log('Running scrapers...');
    const results = await manager.runAllScrapers();
    
    console.log('\n=== Scraping Results ===');
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.scraper}: Success - ${result.result.successCount} items scraped`);
      } else {
        console.log(`❌ ${result.scraper}: Failed - ${result.error}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ScraperManager;
