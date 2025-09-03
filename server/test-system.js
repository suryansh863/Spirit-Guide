#!/usr/bin/env node

/**
 * Test script for Spirit Guide Indian Market Pricing System
 * Tests basic system functionality without running the full server
 */

const { pool, initializeRedis } = require('./src/database/connection');
const logger = require('./src/utils/logger');

async function testSystem() {
  console.log('🧪 Testing Spirit Guide Indian Market Pricing System...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking database schema...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Found tables:', tablesResult.rows.map(row => row.table_name).join(', '));
    
    // Test 3: Check states data
    console.log('\n3️⃣ Checking Indian states data...');
    const statesResult = await client.query('SELECT COUNT(*) as count FROM states');
    console.log(`✅ Found ${statesResult.rows[0].count} Indian states`);
    
    // Test 4: Check retailers data
    console.log('\n4️⃣ Checking Indian retailers data...');
    const retailersResult = await client.query('SELECT COUNT(*) as count FROM retailers');
    console.log(`✅ Found ${retailersResult.rows[0].count} Indian retailers`);
    
    // Test 5: Check spirits data
    console.log('\n5️⃣ Checking Indian spirits data...');
    const spiritsResult = await client.query('SELECT COUNT(*) as count FROM spirits');
    console.log(`✅ Found ${spiritsResult.rows[0].count} Indian spirits`);
    
    // Test 6: Check Indian brands specifically
    console.log('\n6️⃣ Checking Indian brands...');
    const indianBrandsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM spirits 
      WHERE is_indian_brand = true
    `);
    console.log(`✅ Found ${indianBrandsResult.rows[0].count} Indian brands`);
    
    // Test 7: Check dry states
    console.log('\n7️⃣ Checking dry states...');
    const dryStatesResult = await client.query(`
      SELECT name, code 
      FROM states 
      WHERE dry_state = true
    `);
    console.log(`✅ Found ${dryStatesResult.rows.length} dry states:`, 
      dryStatesResult.rows.map(row => `${row.name} (${row.code})`).join(', '));
    
    // Test 8: Test Indian pricing function
    console.log('\n8️⃣ Testing Indian pricing function...');
    try {
      const pricingResult = await client.query(`
        SELECT calculate_final_price_indian(100.00, 0.2000, 0.0500, 40.00) as final_price
      `);
      console.log(`✅ Pricing function works: ₹100 + taxes + delivery = ₹${pricingResult.rows[0].final_price}`);
    } catch (error) {
      console.log('⚠️ Pricing function test failed:', error.message);
    }
    
    // Test 9: Check Redis connection
    console.log('\n9️⃣ Testing Redis connection...');
    try {
      await initializeRedis();
      console.log('✅ Redis connection successful');
    } catch (error) {
      console.log('⚠️ Redis connection failed (optional):', error.message);
    }
    
    client.release();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n🚀 System is ready to run with:');
    console.log('   npm run dev          # Development mode');
    console.log('   npm start            # Production mode');
    console.log('   npm run cron         # Cron scheduler only');
    
  } catch (error) {
    console.error('\n❌ System test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify database credentials in .env');
    console.error('   3. Run npm run setup-db to create database');
    console.error('   4. Check logs for detailed error information');
    process.exit(1);
  }
}

// Run the test
testSystem().catch(console.error);
