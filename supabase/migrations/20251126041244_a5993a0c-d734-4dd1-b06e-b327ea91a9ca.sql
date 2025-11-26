-- Create tables to store AI analysis history
CREATE TABLE public.nft_pricing_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  optimal_price DECIMAL(18, 8),
  confidence INTEGER,
  market_trend TEXT,
  reasoning TEXT,
  strategy TEXT,
  market_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.rental_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_address TEXT NOT NULL,
  nft_value DECIMAL(18, 8),
  duration INTEGER,
  risk_level TEXT,
  collateral_percentage INTEGER,
  risk_score INTEGER,
  risk_factors JSONB,
  mitigation_strategies JSONB,
  explanation TEXT,
  rental_history JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_address TEXT NOT NULL,
  timeframe TEXT,
  sentiment TEXT,
  sentiment_score INTEGER,
  trends JSONB,
  recommendations JSONB,
  prediction TEXT,
  opportunities JSONB,
  risks JSONB,
  summary TEXT,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nft_pricing_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view analyses)
CREATE POLICY "Public read access for pricing analyses"
  ON public.nft_pricing_analyses FOR SELECT
  USING (true);

CREATE POLICY "Public read access for risk assessments"
  ON public.rental_risk_assessments FOR SELECT
  USING (true);

CREATE POLICY "Public read access for market insights"
  ON public.market_insights FOR SELECT
  USING (true);

-- Service role can insert (edge functions)
CREATE POLICY "Service role can insert pricing analyses"
  ON public.nft_pricing_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert risk assessments"
  ON public.rental_risk_assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert market insights"
  ON public.market_insights FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_pricing_nft_address ON public.nft_pricing_analyses(nft_address);
CREATE INDEX idx_pricing_created_at ON public.nft_pricing_analyses(created_at DESC);
CREATE INDEX idx_risk_renter_address ON public.rental_risk_assessments(renter_address);
CREATE INDEX idx_risk_created_at ON public.rental_risk_assessments(created_at DESC);
CREATE INDEX idx_insights_collection ON public.market_insights(collection_address);
CREATE INDEX idx_insights_created_at ON public.market_insights(created_at DESC);