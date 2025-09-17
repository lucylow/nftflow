-- NFTFlow Community Features Database Schema
-- Extends the main schema with community, social, and loyalty features

-- User Profiles and Social Graph
CREATE TABLE user_profiles (
    address VARCHAR(42) PRIMARY KEY,
    avatar_url TEXT,
    bio TEXT,
    reputation_score INTEGER DEFAULT 500 CHECK (reputation_score >= 0 AND reputation_score <= 1000),
    rental_count INTEGER DEFAULT 0,
    dispute_count INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Social metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0
);

-- User follows/following relationships
CREATE TABLE user_follows (
    follower_address VARCHAR(42) NOT NULL,
    followee_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_address, followee_address),
    FOREIGN KEY (follower_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    FOREIGN KEY (followee_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    CHECK (follower_address != followee_address)
);

-- User attestations and verifications
CREATE TABLE user_attestations (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    attestation_type VARCHAR(50) NOT NULL,
    attestation_data JSONB NOT NULL,
    created_by VARCHAR(42) NOT NULL,
    signature TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- User badges and achievements
CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon_url TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Loyalty and Rewards System
CREATE TABLE user_points (
    user_address VARCHAR(42) PRIMARY KEY,
    points_balance INTEGER DEFAULT 0 CHECK (points_balance >= 0),
    points_earned_total INTEGER DEFAULT 0 CHECK (points_earned_total >= 0),
    tier VARCHAR(20) DEFAULT 'BRONZE',
    tier_level INTEGER DEFAULT 0,
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    last_earned TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Point transactions history
CREATE TABLE point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    points_amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('EARN', 'SPEND', 'REFUND', 'BONUS')),
    reason TEXT,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Rewards catalog
CREATE TABLE rewards_catalog (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('TOKEN_AIRDROP', 'NFT_AIRDROP', 'DISCOUNT_CODE', 'PREMIUM_FEATURES', 'CUSTOM_REWARD')),
    reward_data JSONB,
    quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
    quantity_redeemed INTEGER DEFAULT 0 CHECK (quantity_redeemed >= 0),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redeemed rewards tracking
CREATE TABLE redeemed_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    reward_id BIGINT NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    transaction_hash TEXT,
    notes TEXT,
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards_catalog(id) ON DELETE CASCADE
);

-- Community Content System
CREATE TABLE community_posts (
    id BIGSERIAL PRIMARY KEY,
    author_address VARCHAR(42) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('GENERAL', 'COLLECTION_SHOWCASE', 'RENTAL_EXPERIENCE', 'TUTORIAL', 'ANNOUNCEMENT')),
    collection_address VARCHAR(42),
    nft_token_id NUMERIC,
    image_url TEXT,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (author_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Post comments
CREATE TABLE post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_address VARCHAR(42) NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id BIGINT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
);

-- Post likes
CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_address),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Comment likes
CREATE TABLE comment_likes (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_address),
    FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Activity Feed
CREATE TABLE activity_feed (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Notifications System
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- DeFi Integration Tracking
CREATE TABLE defi_integrations (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('STAKING', 'LIQUIDITY_PROVISION', 'YIELD_FARMING', 'TOKEN_SWAP')),
    protocol_name VARCHAR(100) NOT NULL,
    amount NUMERIC NOT NULL,
    token_address VARCHAR(42),
    transaction_hash TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Insurance Pool Participation
CREATE TABLE insurance_pool_participants (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    pool_id VARCHAR(100) NOT NULL,
    contribution_amount NUMERIC NOT NULL,
    contribution_percentage NUMERIC NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Dispute Resolution
CREATE TABLE dispute_resolutions (
    id BIGSERIAL PRIMARY KEY,
    dispute_id VARCHAR(100) NOT NULL,
    rental_id VARCHAR(100) NOT NULL,
    disputer_address VARCHAR(42) NOT NULL,
    resolver_address VARCHAR(42),
    resolution_type VARCHAR(50) NOT NULL CHECK (resolution_type IN ('AUTOMATED', 'COMMUNITY_VOTE', 'EXPERT_REVIEW')),
    resolution_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    FOREIGN KEY (disputer_address) REFERENCES user_profiles(address) ON DELETE CASCADE,
    FOREIGN KEY (resolver_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Governance and DAO
CREATE TABLE governance_proposals (
    id BIGSERIAL PRIMARY KEY,
    proposer_address VARCHAR(42) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    proposal_type VARCHAR(50) NOT NULL CHECK (proposal_type IN ('PROTOCOL_UPGRADE', 'PARAMETER_CHANGE', 'TREASURY_ALLOCATION', 'COMMUNITY_INITIATIVE')),
    proposal_data JSONB NOT NULL,
    voting_power_required NUMERIC NOT NULL,
    voting_duration INTEGER NOT NULL, -- in blocks
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    voting_start_at TIMESTAMPTZ,
    voting_end_at TIMESTAMPTZ,
    FOREIGN KEY (proposer_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Governance votes
CREATE TABLE governance_votes (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT NOT NULL,
    voter_address VARCHAR(42) NOT NULL,
    vote_choice VARCHAR(20) NOT NULL CHECK (vote_choice IN ('FOR', 'AGAINST', 'ABSTAIN')),
    voting_power NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proposal_id, voter_address),
    FOREIGN KEY (proposal_id) REFERENCES governance_proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Analytics and Metrics
CREATE TABLE user_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_data JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES user_profiles(address) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_reputation ON user_profiles(reputation_score DESC);
CREATE INDEX idx_user_profiles_verified ON user_profiles(verified);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_address);
CREATE INDEX idx_user_follows_followee ON user_follows(followee_address);
CREATE INDEX idx_user_points_tier ON user_points(tier);
CREATE INDEX idx_point_transactions_user ON point_transactions(user_address);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX idx_community_posts_author ON community_posts(author_address);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_address);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type);
CREATE INDEX idx_notifications_user ON notifications(user_address);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_defi_integrations_user ON defi_integrations(user_address);
CREATE INDEX idx_defi_integrations_type ON defi_integrations(integration_type);
CREATE INDEX idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX idx_governance_votes_proposal ON governance_votes(proposal_id);

-- Functions for updating counters
CREATE OR REPLACE FUNCTION update_profile_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Update followers count
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles 
        SET followers_count = followers_count + 1 
        WHERE address = NEW.followee_address;
        
        UPDATE user_profiles 
        SET following_count = following_count + 1 
        WHERE address = NEW.follower_address;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles 
        SET followers_count = followers_count - 1 
        WHERE address = OLD.followee_address;
        
        UPDATE user_profiles 
        SET following_count = following_count - 1 
        WHERE address = OLD.follower_address;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic counter updates
CREATE TRIGGER update_follow_counters
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_profile_counters();

CREATE TRIGGER update_post_counters
    AFTER INSERT ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_profile_counters();

-- Views for common queries
CREATE VIEW user_profile_summary AS
SELECT 
    up.address,
    up.avatar_url,
    up.bio,
    up.reputation_score,
    up.rental_count,
    up.dispute_count,
    up.current_streak,
    up.verified,
    up.followers_count,
    up.following_count,
    up.posts_count,
    up.likes_received,
    up.points_balance,
    up.tier,
    up.discount_percentage,
    up.last_activity
FROM user_profiles up
LEFT JOIN user_points upoints ON up.address = upoints.user_address;

CREATE VIEW trending_posts AS
SELECT 
    cp.*,
    up.avatar_url as author_avatar,
    up.reputation_score as author_reputation,
    up.verified as author_verified,
    (cp.likes_count + cp.comments_count * 2 + cp.shares_count * 3) as engagement_score
FROM community_posts cp
JOIN user_profiles up ON cp.author_address = up.address
WHERE cp.created_at >= NOW() - INTERVAL '7 days'
ORDER BY engagement_score DESC;

-- Grant permissions
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nftflow_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nftflow_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nftflow_user;
