-- Spirit Guide Pricing System Database Schema
-- PostgreSQL Database - INDIAN MARKET FOCUS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Indian States table with excise and sales tax rates
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(2) NOT NULL UNIQUE,
    excise_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    sales_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    alcohol_control_state BOOLEAN DEFAULT FALSE,
    dry_state BOOLEAN DEFAULT FALSE,
    online_delivery_allowed BOOLEAN DEFAULT TRUE,
    home_delivery_allowed BOOLEAN DEFAULT TRUE,
    max_quantity_per_person INTEGER DEFAULT 2, -- bottles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indian Retailers table for scraping configuration
CREATE TABLE retailers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    website_url TEXT NOT NULL,
    operating_states TEXT[], -- Array of state codes where retailer operates
    scraping_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    retailer_type VARCHAR(50) DEFAULT 'online', -- online, offline, government
    delivery_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indian Spirits table for product information
CREATE TABLE spirits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    abv DECIMAL(4,2),
    category VARCHAR(100), -- IMFL, Indian Whisky, Imported, etc.
    region VARCHAR(100), -- Indian region or country of origin
    image_url TEXT,
    description TEXT,
    manufacturer VARCHAR(200), -- United Spirits, Radico Khaitan, etc.
    bottle_size VARCHAR(50) DEFAULT '750ml', -- 180ml, 375ml, 750ml, 1000ml
    mrp DECIMAL(10,2), -- Maximum Retail Price
    is_indian_brand BOOLEAN DEFAULT TRUE,
    available_states TEXT[], -- Array of state codes where available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prices table for current pricing data (Indian market)
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    spirit_id INTEGER NOT NULL REFERENCES spirits(id) ON DELETE CASCADE,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    retailer_id INTEGER NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    mrp_price DECIMAL(10,2), -- MRP for this state
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    availability_status VARCHAR(50) DEFAULT 'available',
    delivery_charges DECIMAL(10,2) DEFAULT 0.00,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(spirit_id, state_id, retailer_id)
);

-- Price history table for tracking changes over time
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    price_id INTEGER NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change DECIMAL(10,2) NOT NULL,
    change_percentage DECIMAL(5,2) NOT NULL,
    change_reason VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indian Festival/Seasonal pricing table
CREATE TABLE seasonal_pricing (
    id SERIAL PRIMARY KEY,
    spirit_id INTEGER NOT NULL REFERENCES spirits(id) ON DELETE CASCADE,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    festival_name VARCHAR(100) NOT NULL, -- Diwali, Holi, New Year, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    special_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scraping logs table for monitoring and debugging
CREATE TABLE scraping_logs (
    id SERIAL PRIMARY KEY,
    retailer_id INTEGER REFERENCES retailers(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    execution_time_ms INTEGER,
    records_scraped INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indian proxy configuration table for rotation
CREATE TABLE proxy_configs (
    id SERIAL PRIMARY KEY,
    proxy_url TEXT NOT NULL,
    proxy_type VARCHAR(20) DEFAULT 'http',
    is_active BOOLEAN DEFAULT TRUE,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User agents table for rotation
CREATE TABLE user_agents (
    id SERIAL PRIMARY KEY,
    user_agent_string TEXT NOT NULL,
    browser_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_prices_spirit_state ON prices(spirit_id, state_id);
CREATE INDEX idx_prices_retailer ON prices(retailer_id);
CREATE INDEX idx_prices_scraped_at ON prices(scraped_at);
CREATE INDEX idx_prices_mrp ON prices(mrp_price);
CREATE INDEX idx_price_history_price_id ON price_history(price_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX idx_scraping_logs_retailer ON scraping_logs(retailer_id);
CREATE INDEX idx_scraping_logs_status ON scraping_logs(status);
CREATE INDEX idx_scraping_logs_started_at ON scraping_logs(started_at);
CREATE INDEX idx_seasonal_pricing_festival ON seasonal_pricing(festival_name);
CREATE INDEX idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);

-- Composite indexes for common queries
CREATE INDEX idx_prices_spirit_state_retailer ON prices(spirit_id, state_id, retailer_id);
CREATE INDEX idx_prices_state_retailer ON prices(state_id, retailer_id);
CREATE INDEX idx_spirits_brand_type ON spirits(brand, type);
CREATE INDEX idx_spirits_manufacturer ON spirits(manufacturer);
CREATE INDEX idx_spirits_available_states ON spirits USING GIN (available_states);

-- Full-text search index for spirits
CREATE INDEX idx_spirits_search ON spirits USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || type || ' ' || manufacturer));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retailers_updated_at BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spirits_updated_at BEFORE UPDATE ON spirits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proxy_configs_updated_at BEFORE UPDATE ON proxy_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_agents_updated_at BEFORE UPDATE ON user_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate final price with Indian taxes
CREATE OR REPLACE FUNCTION calculate_final_price_indian(
    base_price DECIMAL,
    excise_tax_rate DECIMAL,
    sales_tax_rate DECIMAL,
    delivery_charges DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
BEGIN
    RETURN base_price * (1 + excise_tax_rate + sales_tax_rate) + delivery_charges;
END;
$$ LANGUAGE plpgsql;

-- Function to get price comparison across Indian retailers
CREATE OR REPLACE FUNCTION get_indian_price_comparison(
    p_spirit_id INTEGER,
    p_state_id INTEGER
) RETURNS TABLE (
    retailer_name VARCHAR,
    base_price DECIMAL,
    final_price DECIMAL,
    tax_amount DECIMAL,
    mrp_price DECIMAL,
    discount_percentage DECIMAL,
    delivery_charges DECIMAL,
    availability_status VARCHAR,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.name as retailer_name,
        p.base_price,
        p.final_price,
        p.tax_amount,
        p.mrp_price,
        p.discount_percentage,
        p.delivery_charges,
        p.availability_status,
        p.updated_at as last_updated
    FROM prices p
    JOIN retailers r ON p.retailer_id = r.id
    WHERE p.spirit_id = p_spirit_id 
    AND p.state_id = p_state_id
    AND p.availability_status = 'available'
    AND r.is_active = true
    ORDER BY p.final_price ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get spirits available in a specific state
CREATE OR REPLACE FUNCTION get_spirits_by_state(
    p_state_code VARCHAR
) RETURNS TABLE (
    spirit_id INTEGER,
    spirit_name VARCHAR,
    brand VARCHAR,
    type VARCHAR,
    manufacturer VARCHAR,
    mrp DECIMAL,
    available_retailers INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as spirit_id,
        s.name as spirit_name,
        s.brand,
        s.type,
        s.manufacturer,
        s.mrp,
        COUNT(DISTINCT p.retailer_id) as available_retailers
    FROM spirits s
    LEFT JOIN prices p ON s.id = p.spirit_id
    LEFT JOIN states st ON p.state_id = st.id
    WHERE (st.code = p_state_code OR p_state_code = ANY(s.available_states))
    AND s.is_active = true
    GROUP BY s.id, s.name, s.brand, s.type, s.manufacturer, s.mrp
    ORDER BY s.brand, s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get festival pricing for a spirit
CREATE OR REPLACE FUNCTION get_festival_pricing(
    p_spirit_id INTEGER,
    p_state_id INTEGER,
    p_festival_name VARCHAR
) RETURNS TABLE (
    festival_name VARCHAR,
    discount_percentage DECIMAL,
    special_price DECIMAL,
    start_date DATE,
    end_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.festival_name,
        sp.discount_percentage,
        sp.special_price,
        sp.start_date,
        sp.end_date
    FROM seasonal_pricing sp
    WHERE sp.spirit_id = p_spirit_id 
    AND sp.state_id = p_state_id
    AND sp.festival_name = p_festival_name
    AND CURRENT_DATE BETWEEN sp.start_date AND sp.end_date;
END;
$$ LANGUAGE plpgsql;
