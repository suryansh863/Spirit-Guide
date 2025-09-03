# 🥃 Spirit Guide Automated Pricing System - INDIAN MARKET

A comprehensive, real-time pricing system for alcoholic beverages specifically designed for the Indian market with automated scraping, state-specific tax calculations, and intelligent price tracking across major Indian retailers.

## ✨ Features

### 🔄 **Automated Price Updates**
- **Daily Scraping**: Automated price collection from major Indian liquor retailers
- **Real-time Data**: Live pricing information with automatic updates
- **Smart Scheduling**: Configurable cron jobs for optimal performance

### 🏛️ **Indian State-Specific Pricing**
- **Tax Calculations**: Automatic excise and sales tax computation for all Indian states
- **Regional Variations**: State-specific pricing and availability tracking
- **Alcohol Control States**: Special handling for states with government control
- **Dry States**: Proper handling of Gujarat, Bihar, and other dry states
- **Delivery Restrictions**: State-wise online delivery and home delivery regulations

### 📊 **Advanced Analytics**
- **Price History**: Complete tracking of price changes over time
- **Price Comparisons**: Cross-retailer price analysis across Indian states
- **Price Alerts**: Notifications for significant price changes
- **Trend Analysis**: Historical pricing patterns and insights
- **Festival Pricing**: Seasonal and festival-specific pricing tracking

### 🛡️ **Enterprise-Grade Infrastructure**
- **PostgreSQL Database**: Robust data storage with automated backups
- **Redis Caching**: High-performance caching for API responses
- **Rate Limiting**: Protection against abuse and overload
- **Proxy Rotation**: Anti-detection mechanisms for reliable scraping

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Cron Jobs     │
│   (React App)   │◄──►│   (Express)     │◄──►│   (Scheduler)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │   Scrapers      │
                       │   Database      │◄──►│   (Puppeteer)   │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Optional)    │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** 12+
- **Redis** 6+ (optional but recommended)
- **Git**

### 1. Clone and Install
```bash
git clone <repository-url>
cd server
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your database credentials and configuration
```

### 3. Database Setup
```bash
# Create and populate database with Indian market data
npm run setup-db

# Run migrations (if any)
npm run migrate
```

### 4. Start the System
```bash
# Development mode
npm run dev

# Production mode
npm start

# Start cron scheduler only
npm run cron
```

## 📋 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `spirit_guide_pricing` |
| `REDIS_HOST` | Redis host | `localhost` |
| `PORT` | API server port | `3001` |
| `SCRAPING_DELAY` | Delay between requests (ms) | `2000` |
| `PRICE_UPDATE_CRON` | Price update schedule | `0 2 * * *` |

### Cron Job Schedules

| Job | Schedule | Description |
|-----|----------|-------------|
| Price Updates | `0 2 * * *` | Daily at 2 AM |
| Database Backup | `0 3 * * 0` | Weekly on Sunday at 3 AM |
| System Cleanup | `0 4 * * *` | Daily at 4 AM |
| Health Checks | `*/30 * * * *` | Every 30 minutes |

## 🗄️ Database Schema

### Core Tables

#### `spirits`
- Product information (name, brand, type, ABV)
- Category classification (IMFL, Indian Whisky, Imported, etc.)
- Indian region or country of origin
- Manufacturer information (United Spirits, Radico Khaitan, etc.)
- Bottle sizes (180ml, 375ml, 750ml, 1000ml)
- MRP (Maximum Retail Price)
- Indian brand flags and available states

#### `states`
- Indian state information and tax rates
- Excise tax and sales tax percentages
- Alcohol control state flags
- Dry state flags (Gujarat, Bihar)
- Online delivery and home delivery permissions
- Maximum quantity per person restrictions

#### `retailers`
- Indian retailer configuration and scraping settings
- Operating states array
- Retailer type (online, offline, government)
- Delivery availability and success rates
- Last scrape timestamps

#### `prices`
- Current pricing data with Indian market specifics
- Base price, final price, and tax calculations
- MRP prices and discount percentages
- Delivery charges and minimum order amounts
- Availability status and last update

#### `price_history`
- Complete price change tracking
- Change amounts and percentages
- Timestamps and reasons

#### `seasonal_pricing`
- Festival and seasonal pricing data
- Diwali, Holi, New Year special prices
- Start and end dates with discount percentages

### Database Functions

```sql
-- Calculate final price with Indian taxes and delivery charges
SELECT calculate_final_price_indian(base_price, excise_tax_rate, sales_tax_rate, delivery_charges);

-- Get price comparison across Indian retailers
SELECT * FROM get_indian_price_comparison(spirit_id, state_id);

-- Get spirits available in a specific Indian state
SELECT * FROM get_spirits_by_state(state_code);

-- Get festival pricing for a spirit
SELECT * FROM get_festival_pricing(spirit_id, state_id, festival_name);
```

## 🔌 API Endpoints

### Pricing API

#### Get Spirit Prices
```http
GET /api/pricing/spirit/:spiritId?state=MH&retailer=1
```

#### Price Comparison
```http
GET /api/pricing/compare/:spiritId/:stateCode
```

#### Get Spirits by State
```http
GET /api/pricing/state/:stateCode?category=IMFL&manufacturer=United%20Spirits&priceRange=500-1500
```

#### Festival Pricing
```http
GET /api/pricing/festival/:spiritId/:stateCode/Diwali
```

#### Price History
```http
GET /api/pricing/history/:spiritId/:stateCode?days=30&retailer=1
```

#### Price Alerts
```http
GET /api/pricing/alerts?threshold=10&days=7
```

#### Statistics
```http
GET /api/pricing/stats
```

### Response Examples

#### Price Data (Indian Market)
```json
{
  "spirit": {
    "id": 1,
    "name": "McDowell's No.1",
    "brand": "McDowell's",
    "type": "whisky",
    "manufacturer": "United Spirits",
    "bottleSize": "750ml",
    "mrp": 850.00,
    "isIndianBrand": true
  },
  "pricing": [
    {
      "state": {
        "id": 1,
        "name": "Maharashtra",
        "code": "MH",
        "dryState": false,
        "onlineDeliveryAllowed": true,
        "homeDeliveryAllowed": true,
        "maxQuantityPerPerson": 2
      },
      "prices": [
        {
          "retailer": {
            "id": 1,
            "name": "BigBasket",
            "type": "online",
            "deliveryAvailable": true
          },
          "basePrice": 850.00,
          "finalPrice": 952.00,
          "taxAmount": 102.00,
          "mrpPrice": 850.00,
          "discountPercentage": 0.00,
          "deliveryCharges": 40.00,
          "minimumOrderAmount": 500.00,
          "availability": "available",
          "lastUpdated": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

## 🕷️ Scraping System

### Base Scraper Features
- **Proxy Rotation**: Automatic proxy switching for anti-detection
- **User Agent Rotation**: Dynamic browser fingerprinting
- **Retry Logic**: Intelligent retry mechanisms with exponential backoff
- **Screenshot Debugging**: Automatic screenshots for failed scrapes
- **Rate Limiting**: Configurable delays between requests

### Indian Retailers Supported

#### Major Online Platforms
- **BigBasket**: Alcohol section with delivery charges and minimum orders
- **Swiggy Instamart**: Alcohol delivery with state-specific availability
- **Living Liquidz**: Premium spirits retailer
- **HipBar**: Delhi/NCR focused delivery service
- **Wine Park**: Maharashtra and surrounding states

#### State-Specific Retailers
- **Karnataka Wine Store**: Karnataka state retailer
- **Delhi Duty Free**: Offline retailer for Delhi

### Adding New Indian Retailers

1. **Create Scraper Class**
```javascript
class NewIndianRetailerScraper extends BaseScraper {
  constructor() {
    super(retailerId, options);
  }

  async extractProductData(selectors) {
    // Implement specific extraction logic for Indian market
    // Handle MRP, delivery charges, minimum orders
  }
}
```

2. **Add to Cron Scheduler**
```javascript
createScraper(retailer) {
  switch (retailer.name) {
    case 'BigBasket': return new BigBasketScraper();
    case 'Swiggy Instamart': return new SwiggyScraper();
    case 'New Retailer': return new NewIndianRetailerScraper();
    default: return null;
  }
}
```

3. **Configure Database**
```sql
INSERT INTO retailers (name, website_url, operating_states, scraping_config, retailer_type, delivery_available) 
VALUES ('New Retailer', 'https://example.com', ARRAY['DL', 'MH', 'KA'], '{"selectors": {...}}', 'online', true);
```

## 📈 Monitoring & Logging

### Log Files
- `logs/combined.log` - All application logs
- `logs/error.log` - Error logs only
- `logs/scraping.log` - Scraping-specific logs
- `logs/price-updates.log` - Price change logs

### Health Checks
```http
GET /health
```

Response includes:
- Database connection status
- Redis connection status
- Cron job status
- System uptime and memory usage

### Performance Metrics
- Scraping success rates by retailer
- API response times
- Database query performance
- Cache hit rates
- Indian market specific statistics

## 🔒 Security Features

- **Rate Limiting**: Per-IP request throttling
- **Input Validation**: Comprehensive parameter validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configurable cross-origin policies
- **Helmet Security**: Security headers and CSP

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   LOG_LEVEL=warn
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/server.js --name "spirit-guide-pricing-indian"
   ```

3. **Database Optimization**
   ```sql
   -- Create additional indexes for production
   CREATE INDEX CONCURRENTLY idx_prices_created_at ON prices(created_at);
   CREATE INDEX CONCURRENTLY idx_spirits_manufacturer ON spirits(manufacturer);
   ```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test pricing endpoint for Indian spirit
curl http://localhost:3001/api/pricing/spirit/1

# Test state-specific pricing
curl http://localhost:3001/api/pricing/state/MH
```

## 📊 Performance Optimization

### Caching Strategy
- **Redis Caching**: 5-15 minute cache for pricing data
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management

### Scraping Optimization
- **Concurrent Scrapers**: Configurable parallel processing
- **Smart Delays**: Adaptive delays based on retailer response
- **Resource Management**: Automatic cleanup of browser instances
- **State-Specific Scraping**: Only scrape states where retailer operates

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection parameters
psql -h localhost -U postgres -d spirit_guide_pricing
```

#### Scraping Failures
```bash
# Check logs
tail -f logs/scraping.log

# Verify retailer configuration
SELECT * FROM retailers WHERE is_active = true;
```

#### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Restart with more memory
pm2 restart spirit-guide-pricing-indian --max-memory-restart 1G
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Take screenshots on errors
DEBUG_SCREENSHOTS=true npm run dev
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-indian-retailer`
3. **Implement changes** with proper testing
4. **Update documentation** as needed
5. **Submit pull request**

### Development Guidelines
- Follow existing code style and patterns
- Add comprehensive logging for new features
- Include error handling and validation
- Write tests for new functionality
- Update API documentation
- Consider Indian market specifics (MRP, taxes, delivery)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/api.md)
- [Database Schema](docs/schema.md)
- [Scraping Guide](docs/scraping.md)
- [Indian Market Guide](docs/indian-market.md)

### Issues
- Report bugs via GitHub Issues
- Include logs and error details
- Provide reproduction steps

### Community
- Join our Discord server
- Follow updates on Twitter
- Contribute to discussions

---

**Built with ❤️ for the Indian Spirit Guide community**

*Automating the way you discover and compare spirit prices across India's diverse states and retailers*
