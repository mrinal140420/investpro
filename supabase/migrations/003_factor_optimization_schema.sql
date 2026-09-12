-- ============================================================================
-- InvestPro — Migration: 003_factor_optimization_schema.sql
-- Table: Historical Rolling Return Metrics & Factor Model Portfolios
-- ============================================================================

-- 1. Table: Historical Rolling Return Metrics
CREATE TABLE IF NOT EXISTS fund_rolling_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isin VARCHAR(12) NOT NULL,
    scheme_name TEXT NOT NULL,
    window_years INT DEFAULT 7,
    median_rolling_return NUMERIC(5, 2) NOT NULL,
    min_rolling_return NUMERIC(5, 2) NOT NULL,
    max_rolling_return NUMERIC(5, 2) NOT NULL,
    negative_periods_pct NUMERIC(5, 2) DEFAULT 0.00,
    upside_capture NUMERIC(5, 2) NOT NULL,
    downside_capture NUMERIC(5, 2) NOT NULL,
    capture_ratio NUMERIC(5, 2) GENERATED ALWAYS AS (upside_capture / NULLIF(downside_capture, 0)) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(isin, window_years)
);

CREATE INDEX IF NOT EXISTS idx_rolling_metrics_isin ON fund_rolling_metrics(isin);
CREATE INDEX IF NOT EXISTS idx_rolling_metrics_median ON fund_rolling_metrics(median_rolling_return DESC);

-- 2. Table: Factor Model Allocations
CREATE TABLE IF NOT EXISTS factor_model_portfolios (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(50) NOT NULL UNIQUE,
    target_xirr_min NUMERIC(4, 2) NOT NULL, -- e.g., 15.00
    target_xirr_max NUMERIC(4, 2) NOT NULL, -- e.g., 17.00
    large_cap_weight NUMERIC(4, 2) NOT NULL,
    mid_small_alpha_weight NUMERIC(4, 2) NOT NULL,
    momentum_factor_weight NUMERIC(4, 2) NOT NULL,
    gold_weight NUMERIC(4, 2) NOT NULL,
    liquid_debt_weight NUMERIC(4, 2) NOT NULL,
    rebalance_frequency VARCHAR(20) DEFAULT 'ANNUAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security Policies
ALTER TABLE fund_rolling_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE factor_model_portfolios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read access for rolling metrics"
        ON fund_rolling_metrics FOR SELECT TO authenticated
        USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for factor models"
        ON factor_model_portfolios FOR SELECT TO authenticated
        USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Baseline Seed Data: 50/30/10/10 Barbell & Benchmark Models
INSERT INTO factor_model_portfolios (
    model_name,
    target_xirr_min,
    target_xirr_max,
    large_cap_weight,
    mid_small_alpha_weight,
    momentum_factor_weight,
    gold_weight,
    liquid_debt_weight,
    rebalance_frequency
) VALUES 
    ('Conservative Large-Cap Baseline', 11.00, 12.00, 70.00, 10.00, 0.00, 10.00, 10.00, 'ANNUAL'),
    ('InvestPro Factor Barbell (50/30/10/10)', 15.00, 16.50, 30.00, 20.00, 30.00, 10.00, 10.00, 'ANNUAL'),
    ('Aggressive Momentum Alpha', 16.50, 17.50, 20.00, 25.00, 45.00, 5.00, 5.00, 'SEMI_ANNUAL')
ON CONFLICT (model_name) DO UPDATE SET
    target_xirr_min = EXCLUDED.target_xirr_min,
    target_xirr_max = EXCLUDED.target_xirr_max,
    large_cap_weight = EXCLUDED.large_cap_weight,
    mid_small_alpha_weight = EXCLUDED.mid_small_alpha_weight,
    momentum_factor_weight = EXCLUDED.momentum_factor_weight,
    gold_weight = EXCLUDED.gold_weight,
    liquid_debt_weight = EXCLUDED.liquid_debt_weight;
