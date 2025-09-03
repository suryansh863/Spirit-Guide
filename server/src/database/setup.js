const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// Initial database connection (to postgres database)
const initialPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'yashswisingh',
  password: process.env.DB_PASSWORD,
});

// Target database connection
const targetPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'spirit_guide_pricing',
  user: process.env.DB_USER || 'yashswisingh',
  password: process.env.DB_PASSWORD,
});

// Create database if it doesn't exist
const createDatabase = async () => {
  try {
    const client = await initialPool.connect();
    
    // Check if database exists
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'spirit_guide_pricing']
    );
    
    if (dbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'spirit_guide_pricing'}`);
      logger.info(`Database '${process.env.DB_NAME || 'spirit_guide_pricing'}' created successfully`);
    } else {
      logger.info(`Database '${process.env.DB_NAME || 'spirit_guide_pricing'}' already exists`);
    }
    
    client.release();
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  }
};

// Run schema creation
const runSchema = async () => {
  try {
    const client = await targetPool.connect();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    await client.query(schemaSQL);
    logger.info('Database schema created successfully');
    
    client.release();
  } catch (error) {
    logger.error('Error creating schema:', error);
    throw error;
  }
};

// Seed initial data with Indian market focus
const seedInitialData = async () => {
  try {
    const client = await targetPool.connect();
    
    // Insert Indian states with accurate tax rates and regulations
    const statesData = [
      // Major states with alcohol sales
      { name: 'Delhi', code: 'DL', excise_tax_rate: 0.2000, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Maharashtra', code: 'MH', excise_tax_rate: 0.1500, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Karnataka', code: 'KA', excise_tax_rate: 0.1800, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Tamil Nadu', code: 'TN', excise_tax_rate: 0.2200, sales_tax_rate: 0.0500, alcohol_control_state: true, dry_state: false, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 1 },
      { name: 'West Bengal', code: 'WB', excise_tax_rate: 0.1600, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Telangana', code: 'TS', excise_tax_rate: 0.1700, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Andhra Pradesh', code: 'AP', excise_tax_rate: 0.1900, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Kerala', code: 'KL', excise_tax_rate: 0.2500, sales_tax_rate: 0.0500, alcohol_control_state: true, dry_state: false, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 1 },
      { name: 'Goa', code: 'GA', excise_tax_rate: 0.1200, sales_tax_rate: 0.0400, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 3 },
      { name: 'Punjab', code: 'PB', excise_tax_rate: 0.2000, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Haryana', code: 'HR', excise_tax_rate: 0.1800, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Uttar Pradesh', code: 'UP', excise_tax_rate: 0.2100, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Rajasthan', code: 'RJ', excise_tax_rate: 0.1700, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Madhya Pradesh', code: 'MP', excise_tax_rate: 0.1900, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Gujarat', code: 'GJ', excise_tax_rate: 0.0000, sales_tax_rate: 0.0000, alcohol_control_state: false, dry_state: true, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 0 },
      { name: 'Bihar', code: 'BR', excise_tax_rate: 0.0000, sales_tax_rate: 0.0000, alcohol_control_state: false, dry_state: true, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 0 },
      { name: 'Odisha', code: 'OD', excise_tax_rate: 0.1800, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Jharkhand', code: 'JH', excise_tax_rate: 0.1900, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Chhattisgarh', code: 'CG', excise_tax_rate: 0.1700, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Assam', code: 'AS', excise_tax_rate: 0.2000, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Manipur', code: 'MN', excise_tax_rate: 0.1800, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Meghalaya', code: 'ML', excise_tax_rate: 0.1600, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Tripura', code: 'TR', excise_tax_rate: 0.1700, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Arunachal Pradesh', code: 'AR', excise_tax_rate: 0.1500, sales_tax_rate: 0.0400, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Sikkim', code: 'SK', excise_tax_rate: 0.1400, sales_tax_rate: 0.0400, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Uttarakhand', code: 'UK', excise_tax_rate: 0.1800, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Himachal Pradesh', code: 'HP', excise_tax_rate: 0.1600, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Jammu & Kashmir', code: 'JK', excise_tax_rate: 0.1900, sales_tax_rate: 0.0550, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Chandigarh', code: 'CH', excise_tax_rate: 0.2000, sales_tax_rate: 0.0600, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Dadra and Nagar Haveli', code: 'DN', excise_tax_rate: 0.1500, sales_tax_rate: 0.0400, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Daman and Diu', code: 'DD', excise_tax_rate: 0.1500, sales_tax_rate: 0.0400, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Lakshadweep', code: 'LD', excise_tax_rate: 0.2000, sales_tax_rate: 0.0500, alcohol_control_state: true, dry_state: false, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 1 },
      { name: 'Puducherry', code: 'PY', excise_tax_rate: 0.1800, sales_tax_rate: 0.0500, alcohol_control_state: false, dry_state: false, online_delivery_allowed: true, home_delivery_allowed: true, max_quantity_per_person: 2 },
      { name: 'Andaman and Nicobar Islands', code: 'AN', excise_tax_rate: 0.2000, sales_tax_rate: 0.0500, alcohol_control_state: true, dry_state: false, online_delivery_allowed: false, home_delivery_allowed: false, max_quantity_per_person: 1 }
    ];

    for (const state of statesData) {
      await client.query(
        `INSERT INTO states (name, code, excise_tax_rate, sales_tax_rate, alcohol_control_state, 
                           dry_state, online_delivery_allowed, home_delivery_allowed, max_quantity_per_person) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (code) DO NOTHING`,
        [state.name, state.code, state.excise_tax_rate, state.sales_tax_rate, state.alcohol_control_state,
         state.dry_state, state.online_delivery_allowed, state.home_delivery_allowed, state.max_quantity_per_person]
      );
    }
    logger.info('Indian states data seeded successfully');

    // Insert major Indian liquor retailers
    const retailersData = [
      {
        name: 'BigBasket',
        website_url: 'https://www.bigbasket.com/alcohol',
        operating_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'],
        scraping_config: {
          selectors: {
            price: '.price-selector',
            availability: '.stock-status',
            product_name: '.product-title'
          },
          delay: 2000,
          timeout: 30000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'Swiggy Instamart',
        website_url: 'https://www.swiggy.com/instamart',
        operating_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'],
        scraping_config: {
          selectors: {
            price: '.product-price',
            availability: '.availability-indicator',
            product_name: '.product-name'
          },
          delay: 1500,
          timeout: 25000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'Living Liquidz',
        website_url: 'https://www.livingliquidz.com',
        operating_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'],
        scraping_config: {
          selectors: {
            price: '.price-value',
            availability: '.stock-info',
            product_name: '.item-name'
          },
          delay: 3000,
          timeout: 35000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'HipBar',
        website_url: 'https://www.hipbar.com',
        operating_states: ['DL', 'HR', 'MH', 'KA'],
        scraping_config: {
          selectors: {
            price: '.price-display',
            availability: '.stock-status',
            product_name: '.product-title'
          },
          delay: 2500,
          timeout: 30000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'Wine Park',
        website_url: 'https://www.winepark.in',
        operating_states: ['MH', 'DL', 'KA', 'TS', 'AP'],
        scraping_config: {
          selectors: {
            price: '.price-selector',
            availability: '.stock-status',
            product_name: '.product-title'
          },
          delay: 2000,
          timeout: 30000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'Karnataka Wine Store',
        website_url: 'https://www.karnatakawinestore.com',
        operating_states: ['KA'],
        scraping_config: {
          selectors: {
            price: '.price-value',
            availability: '.stock-info',
            product_name: '.item-name'
          },
          delay: 3000,
          timeout: 35000
        },
        retailer_type: 'online',
        delivery_available: true
      },
      {
        name: 'Delhi Duty Free',
        website_url: 'https://www.delhidutyfree.com',
        operating_states: ['DL'],
        scraping_config: {
          selectors: {
            price: '.price-display',
            availability: '.stock-status',
            product_name: '.product-title'
          },
          delay: 2000,
          timeout: 30000
        },
        retailer_type: 'offline',
        delivery_available: false
      }
    ];

    for (const retailer of retailersData) {
      await client.query(
        `INSERT INTO retailers (name, website_url, operating_states, scraping_config, retailer_type, delivery_available) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) DO NOTHING`,
        [retailer.name, retailer.website_url, retailer.operating_states, retailer.scraping_config, retailer.retailer_type, retailer.delivery_available]
      );
    }
    logger.info('Indian retailers data seeded successfully');

    // Insert major Indian spirits brands
    const spiritsData = [
      // United Spirits (Diageo)
      { name: 'McDowell\'s No.1', brand: 'McDowell\'s', type: 'whisky', category: 'IMFL', manufacturer: 'United Spirits', bottle_size: '750ml', mrp: 850, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      { name: 'Royal Challenge', brand: 'Royal Challenge', type: 'whisky', category: 'IMFL', manufacturer: 'United Spirits', bottle_size: '750ml', mrp: 950, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      { name: 'Signature', brand: 'Signature', type: 'whisky', category: 'IMFL', manufacturer: 'United Spirits', bottle_size: '750ml', mrp: 1200, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      
      // Radico Khaitan
      { name: '8PM Black', brand: '8PM', type: 'whisky', category: 'IMFL', manufacturer: 'Radico Khaitan', bottle_size: '750ml', mrp: 780, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      { name: 'Magic Moments', brand: 'Magic Moments', type: 'vodka', category: 'IMFL', manufacturer: 'Radico Khaitan', bottle_size: '750ml', mrp: 650, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      
      // Allied Blenders
      { name: 'Officer\'s Choice', brand: 'Officer\'s Choice', type: 'whisky', category: 'IMFL', manufacturer: 'Allied Blenders', bottle_size: '750ml', mrp: 720, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      { name: 'Sterling Reserve', brand: 'Sterling Reserve', type: 'whisky', category: 'IMFL', manufacturer: 'Allied Blenders', bottle_size: '750ml', mrp: 1100, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      
      // Som Distilleries
      { name: 'Hunter', brand: 'Hunter', type: 'beer', category: 'Beer', manufacturer: 'Som Distilleries', bottle_size: '650ml', mrp: 120, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      
      // Amrut Distillery
      { name: 'Amrut Single Malt', brand: 'Amrut', type: 'whisky', category: 'Indian Single Malt', manufacturer: 'Amrut Distillery', bottle_size: '750ml', mrp: 4500, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TS', 'AP', 'WB', 'HR', 'PB', 'RJ', 'MP', 'CG', 'OD', 'JH', 'AS', 'MN', 'ML', 'TR', 'AR', 'SK', 'UK', 'HP', 'JK', 'CH', 'DN', 'DD', 'PY'] },
      
      // New brands from previous request
      { name: 'Golfer Shot Blue', brand: 'Golfer Shot', type: 'whisky', category: 'IMFL', manufacturer: 'Golfer Shot', bottle_size: '750ml', mrp: 850, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] },
      { name: 'Golfer Shot Black', brand: 'Golfer Shot', type: 'whisky', category: 'IMFL', manufacturer: 'Golfer Shot', bottle_size: '750ml', mrp: 950, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] },
      { name: 'Rockford Reserve', brand: 'Rockford', type: 'whisky', category: 'IMFL', manufacturer: 'Rockford', bottle_size: '750ml', mrp: 1200, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] },
      { name: 'Rockford Classic', brand: 'Rockford', type: 'whisky', category: 'IMFL', manufacturer: 'Rockford', bottle_size: '750ml', mrp: 980, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] },
      { name: 'All Season Whiskey', brand: 'All Season', type: 'whisky', category: 'IMFL', manufacturer: 'All Season', bottle_size: '750ml', mrp: 720, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] },
      { name: 'Iconic White', brand: 'Iconic', type: 'whisky', category: 'IMFL', manufacturer: 'Iconic', bottle_size: '750ml', mrp: 680, is_indian_brand: true, available_states: ['DL', 'MH', 'KA', 'TN', 'WB', 'TS', 'AP', 'KL', 'GA', 'PB', 'HR', 'UK', 'HP', 'JK', 'AS', 'MN', 'ME', 'TR', 'AR', 'SK', 'RJ', 'MP', 'CG', 'CH', 'DN', 'DD', 'LD', 'PY', 'AN'] }
    ];

    for (const spirit of spiritsData) {
      await client.query(
        `INSERT INTO spirits (name, brand, type, category, manufacturer, bottle_size, mrp, is_indian_brand, available_states) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (name) DO NOTHING`,
        [spirit.name, spirit.brand, spirit.type, spirit.category, spirit.manufacturer, spirit.bottle_size, spirit.mrp, spirit.is_indian_brand, spirit.available_states]
      );
    }
    logger.info('Indian spirits data seeded successfully');

    // Insert sample user agents
    const userAgentsData = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    for (const userAgent of userAgentsData) {
      await client.query(
        `INSERT INTO user_agents (user_agent_string, browser_type) 
         VALUES ($1, $2) 
         ON CONFLICT (user_agent_string) DO NOTHING`,
        [userAgent, 'Chrome']
      );
    }
    logger.info('User agents data seeded successfully');

    client.release();
  } catch (error) {
    logger.error('Error seeding initial data:', error);
    throw error;
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    logger.info('Starting Indian market database setup...');
    
    await createDatabase();
    await runSchema();
    await seedInitialData();
    
    logger.info('Indian market database setup completed successfully!');
    
    // Close connections
    await initialPool.end();
    await targetPool.end();
    
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  setupDatabase,
  createDatabase,
  runSchema,
  seedInitialData
};
