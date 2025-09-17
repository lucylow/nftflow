-- NFTFlow Database Schema
-- PostgreSQL implementation with event sourcing pattern

-- Core Events Table (Immutable Ledger)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  chain_id INTEGER NOT NULL DEFAULT 1, -- Somnia mainnet=1, testnet=50312
  block_number BIGINT,
  tx_hash TEXT,
  log_index INTEGER,
  topic TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('onchain', 'offchain', 'signed_action')),
  payload JSONB NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure idempotency for on-chain events
  UNIQUE (chain_id, tx_hash, log_index)
);

-- Index for efficient event sourcing
CREATE INDEX idx_events_observed ON events(observed_at);
CREATE INDEX idx_events_topic ON events(topic);
CREATE INDEX idx_events_block ON events(block_number);
CREATE INDEX idx_events_chain_block ON events(chain_id, block_number);

-- NFT Listings (Current State Projection)
CREATE TABLE nft_listings (
  id TEXT PRIMARY KEY, -- keccak256(chain_id + nft_contract + token_id)
  chain_id INTEGER NOT NULL,
  nft_contract TEXT NOT NULL,
  token_id NUMERIC NOT NULL,
  owner TEXT NOT NULL,
  price_per_second NUMERIC NOT NULL,
  min_duration INTEGER NOT NULL DEFAULT 60, -- minimum rental in seconds
  max_duration INTEGER NOT NULL DEFAULT 2592000, -- maximum rental (30 days)
  collateral_multiplier NUMERIC NOT NULL DEFAULT 2.0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  as_of_block BIGINT NOT NULL,
  -- For efficient filtering
  UNIQUE (chain_id, nft_contract, token_id)
);

-- Indexes for NFT listings
CREATE INDEX idx_listings_owner ON nft_listings(owner);
CREATE INDEX idx_listings_active ON nft_listings(active);
CREATE INDEX idx_listings_price ON nft_listings(price_per_second);
CREATE INDEX idx_listings_contract ON nft_listings(nft_contract);
CREATE INDEX idx_listings_created ON nft_listings(created_at);

-- Rentals Lifecycle Projection
CREATE TABLE rentals (
  id TEXT PRIMARY KEY, -- rentalId from contract
  listing_id TEXT REFERENCES nft_listings(id) ON DELETE CASCADE,
  renter TEXT NOT NULL,
  lender TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (
    status IN ('requested', 'active', 'completed', 'cancelled', 'disputed')
  ),
  total_price NUMERIC NOT NULL,
  collateral_amount NUMERIC NOT NULL,
  released_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  as_of_block BIGINT NOT NULL
);

-- Indexes for rentals
CREATE INDEX idx_rentals_renter ON rentals(renter);
CREATE INDEX idx_rentals_lender ON rentals(lender);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_start_time ON rentals(start_time);
CREATE INDEX idx_rentals_end_time ON rentals(end_time);

-- User Profiles and Reputation
CREATE TABLE users (
  address TEXT PRIMARY KEY,
  reputation_score NUMERIC DEFAULT 500 CHECK (reputation_score >= 0 AND reputation_score <= 1000),
  total_rentals INTEGER DEFAULT 0,
  successful_rentals INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_reputation ON users(reputation_score);
CREATE INDEX idx_users_total_rentals ON users(total_rentals);

-- Payment Stream Projections
CREATE TABLE streams (
  id TEXT PRIMARY KEY, -- streamId from contract
  rental_id TEXT REFERENCES rentals(id) ON DELETE CASCADE,
  lender TEXT NOT NULL,
  renter TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  released_amount NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  as_of_block BIGINT NOT NULL
);

-- Indexes for streams
CREATE INDEX idx_streams_lender ON streams(lender);
CREATE INDEX idx_streams_renter ON streams(renter);
CREATE INDEX idx_streams_status ON streams(status);

-- NFT Metadata Cache
CREATE TABLE nft_metadata (
  id TEXT PRIMARY KEY, -- keccak256(chain_id + nft_contract + token_id)
  chain_id INTEGER NOT NULL,
  nft_contract TEXT NOT NULL,
  token_id NUMERIC NOT NULL,
  name TEXT,
  description TEXT,
  image_url TEXT,
  animation_url TEXT,
  attributes JSONB,
  metadata_uri TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chain_id, nft_contract, token_id)
);

-- Indexes for metadata
CREATE INDEX idx_metadata_contract ON nft_metadata(nft_contract);
CREATE INDEX idx_metadata_cached ON nft_metadata(cached_at);

-- Daily Metrics (Pre-aggregated)
CREATE TABLE metrics_daily (
  date DATE PRIMARY KEY,
  total_listings INTEGER NOT NULL DEFAULT 0,
  active_listings INTEGER NOT NULL DEFAULT 0,
  total_rentals INTEGER NOT NULL DEFAULT 0,
  active_rentals INTEGER NOT NULL DEFAULT 0,
  completed_rentals INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  platform_fees NUMERIC NOT NULL DEFAULT 0,
  avg_rental_duration INTERVAL NOT NULL DEFAULT '0 seconds',
  unique_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for metrics
CREATE INDEX idx_metrics_date ON metrics_daily(date);

-- Hourly Metrics (for real-time dashboards)
CREATE TABLE metrics_hourly (
  id BIGSERIAL PRIMARY KEY,
  date_hour TIMESTAMPTZ NOT NULL,
  total_listings INTEGER NOT NULL DEFAULT 0,
  active_listings INTEGER NOT NULL DEFAULT 0,
  total_rentals INTEGER NOT NULL DEFAULT 0,
  active_rentals INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  platform_fees NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (date_hour)
);

-- Indexes for hourly metrics
CREATE INDEX idx_metrics_hourly_date ON metrics_hourly(date_hour);

-- Dispute Resolution
CREATE TABLE disputes (
  id TEXT PRIMARY KEY,
  rental_id TEXT REFERENCES rentals(id) ON DELETE CASCADE,
  disputer TEXT NOT NULL,
  dispute_type TEXT NOT NULL CHECK (
    dispute_type IN ('late_return', 'damage', 'non_payment', 'other')
  ),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'investigating', 'resolved', 'rejected')
  ),
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for disputes
CREATE INDEX idx_disputes_rental ON disputes(rental_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_disputer ON disputes(disputer);

-- Configuration Parameters (for governance)
CREATE TABLE config_parameters (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL
);

-- Insert default configuration parameters
INSERT INTO config_parameters (key, value, min_value, max_value, description, updated_by) VALUES
('platform_fee_bps', 250, 0, 1000, 'Platform fee in basis points (2.5%)', 'system'),
('min_rental_duration', 60, 1, 300, 'Minimum rental duration in seconds', 'system'),
('max_rental_duration', 2592000, 3600, 31536000, 'Maximum rental duration in seconds (30 days)', 'system'),
('collateral_multiplier', 200, 100, 500, 'Collateral multiplier in basis points (2.0x)', 'system'),
('reputation_threshold', 500, 0, 1000, 'Minimum reputation score for certain actions', 'system');

-- Audit Log for sensitive operations
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_audit_user ON audit_log(user_address);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_nft_listings_updated_at BEFORE UPDATE ON nft_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate listing ID
CREATE OR REPLACE FUNCTION generate_listing_id(
    p_chain_id INTEGER,
    p_nft_contract TEXT,
    p_token_id NUMERIC
) RETURNS TEXT AS $$
BEGIN
    RETURN p_chain_id || ':' || p_nft_contract || ':' || p_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation(
    p_address TEXT,
    p_reputation_change NUMERIC
) RETURNS VOID AS $$
BEGIN
    INSERT INTO users (address, reputation_score, updated_at)
    VALUES (p_address, 500 + p_reputation_change, NOW())
    ON CONFLICT (address) DO UPDATE SET
        reputation_score = GREATEST(0, LEAST(1000, users.reputation_score + p_reputation_change)),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- View for active rentals with listing details
CREATE VIEW active_rentals_view AS
SELECT 
    r.id as rental_id,
    r.renter,
    r.lender,
    r.start_time,
    r.end_time,
    r.total_price,
    r.collateral_amount,
    l.nft_contract,
    l.token_id,
    l.price_per_second,
    m.name as nft_name,
    m.image_url as nft_image
FROM rentals r
JOIN nft_listings l ON r.listing_id = l.id
LEFT JOIN nft_metadata m ON m.id = l.id
WHERE r.status = 'active';

-- View for marketplace listings with metadata
CREATE VIEW marketplace_listings_view AS
SELECT 
    l.id,
    l.chain_id,
    l.nft_contract,
    l.token_id,
    l.owner,
    l.price_per_second,
    l.min_duration,
    l.max_duration,
    l.collateral_multiplier,
    l.verified,
    l.active,
    l.created_at,
    l.updated_at,
    m.name,
    m.description,
    m.image_url,
    m.animation_url,
    m.attributes
FROM nft_listings l
LEFT JOIN nft_metadata m ON m.id = l.id
WHERE l.active = true;

-- Materialized view for daily statistics (refreshed hourly)
CREATE MATERIALIZED VIEW daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_rentals,
    COUNT(*) FILTER (WHERE status = 'active') as active_rentals,
    SUM(total_price) FILTER (WHERE status = 'completed') as daily_volume,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) FILTER (WHERE status = 'completed') as avg_duration_seconds
FROM rentals
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nftflow_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nftflow_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nftflow_user;
