const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const { pool } = require('../database/connection');
const logger = require('../utils/logger');
const UserAgents = require('user-agents');

// Add stealth and adblocker plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

class BaseScraper {
  constructor(retailerId, options = {}) {
    this.retailerId = retailerId;
    this.options = {
      headless: true,
      timeout: 30000,
      delay: 2000,
      maxRetries: 3,
      ...options
    };
    
    this.browser = null;
    this.page = null;
    this.logger = logger.createComponentLogger(`Scraper-${retailerId}`);
    this.currentProxy = null;
    this.currentUserAgent = null;
  }

  // Initialize browser with proxy and user agent rotation
  async initialize() {
    try {
      this.logger.info('Initializing scraper');
      
      // Get proxy and user agent
      await this.rotateProxy();
      await this.rotateUserAgent();
      
      // Launch browser
      const launchOptions = {
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ]
      };

      // Add proxy if available
      if (this.currentProxy) {
        launchOptions.args.push(`--proxy-server=${this.currentProxy.proxy_url}`);
      }

      this.browser = await puppeteer.launch(launchOptions);
      
      // Create new page
      this.page = await this.browser.newPage();
      
      // Set user agent
      if (this.currentUserAgent) {
        await this.page.setUserAgent(this.currentUserAgent.user_agent_string);
      }
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set extra headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      this.logger.info('Scraper initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize scraper', error);
      return false;
    }
  }

  // Rotate proxy for anti-detection
  async rotateProxy() {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM proxy_configs 
         WHERE is_active = true 
         ORDER BY success_rate DESC, last_used_at ASC NULLS FIRST 
         LIMIT 1`
      );
      client.release();

      if (result.rows.length > 0) {
        this.currentProxy = result.rows[0];
        this.logger.info(`Using proxy: ${this.currentProxy.proxy_url}`);
        
        // Update last used timestamp
        await this.updateProxyUsage(this.currentProxy.id);
      } else {
        this.logger.warn('No active proxies available');
      }
    } catch (error) {
      this.logger.error('Error rotating proxy', error);
    }
  }

  // Rotate user agent for anti-detection
  async rotateUserAgent() {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM user_agents 
         WHERE is_active = true 
         ORDER BY success_rate DESC, last_used_at ASC NULLS FIRST 
         LIMIT 1`
      );
      client.release();

      if (result.rows.length > 0) {
        this.currentProxy = result.rows[0];
        this.logger.info(`Using user agent: ${this.currentUserAgent.user_agent_string.substring(0, 50)}...`);
        
        // Update last used timestamp
        await this.updateUserAgentUsage(this.currentUserAgent.id);
      } else {
        // Fallback to generated user agent
        const userAgent = new UserAgents();
        this.currentUserAgent = { user_agent_string: userAgent.toString() };
        this.logger.info('Using generated user agent');
      }
    } catch (error) {
      this.logger.error('Error rotating user agent', error);
      // Fallback to generated user agent
      const userAgent = new UserAgents();
      this.currentUserAgent = { user_agent_string: userAgent.toString() };
    }
  }

  // Update proxy usage statistics
  async updateProxyUsage(proxyId) {
    try {
      const client = await pool.connect();
      await client.query(
        'UPDATE proxy_configs SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [proxyId]
      );
      client.release();
    } catch (error) {
      this.logger.error('Error updating proxy usage', error);
    }
  }

  // Update user agent usage statistics
  async updateUserAgentUsage(userAgentId) {
    try {
      const client = await pool.connect();
      await client.query(
        'UPDATE user_agents SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userAgentId]
      );
      client.release();
    } catch (error) {
      this.logger.error('Error updating user agent usage', error);
    }
  }

  // Navigate to URL with retry logic
  async navigateTo(url, retryCount = 0) {
    try {
      this.logger.info(`Navigating to: ${url}`);
      
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout
      });

      // Wait for delay
      await this.delay(this.options.delay);
      
      return true;
    } catch (error) {
      this.logger.error(`Navigation failed (attempt ${retryCount + 1}): ${error.message}`);
      
      if (retryCount < this.options.maxRetries) {
        this.logger.info(`Retrying navigation...`);
        await this.delay(5000); // Wait 5 seconds before retry
        return this.navigateTo(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Wait for element with timeout
  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      this.logger.warn(`Element not found: ${selector}`);
      return false;
    }
  }

  // Extract text from element
  async extractText(selector) {
    try {
      const element = await this.page.$(selector);
      if (element) {
        const text = await this.page.evaluate(el => el.textContent.trim(), element);
        return text;
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to extract text from: ${selector}`);
      return null;
    }
  }

  // Extract price from text
  extractPrice(text) {
    if (!text) return null;
    
    // Remove currency symbols and extract numeric value
    const priceMatch = text.replace(/[^\d.,]/g, '').match(/(\d+[.,]\d+|\d+)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'));
    }
    
    return null;
  }

  // Check if element exists
  async elementExists(selector) {
    try {
      const element = await this.page.$(selector);
      return element !== null;
    } catch (error) {
      return false;
    }
  }

  // Take screenshot for debugging
  async takeScreenshot(filename) {
    try {
      const screenshotPath = `./logs/screenshots/${filename}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      this.logger.error('Failed to take screenshot', error);
      return null;
    }
  }

  // Delay function
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Close browser
  async close() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      this.logger.info('Scraper closed successfully');
    } catch (error) {
      this.logger.error('Error closing scraper', error);
    }
  }

  // Abstract method to be implemented by child classes
  async scrape() {
    throw new Error('scrape() method must be implemented by child class');
  }

  // Abstract method to extract product data
  async extractProductData() {
    throw new Error('extractProductData() method must be implemented by child class');
  }
}

module.exports = BaseScraper;
