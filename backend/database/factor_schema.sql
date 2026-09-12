-- ============================================================================
-- InvestPro — Database Schema: Factor Models & Rolling Return Metrics
-- File: backend/database/factor_schema.sql
-- ============================================================================

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

CREATE TABLE IF NOT EXISTS factor_model_portfolios (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(50) NOT NULL UNIQUE,
    target_xirr_min NUMERIC(4, 2) NOT NULL,
    target_xirr_max NUMERIC(4, 2) NOT NULL,
    large_cap_weight NUMERIC(4, 2) NOT NULL,
    mid_small_alpha_weight NUMERIC(4, 2) NOT NULL,
    momentum_factor_weight NUMERIC(4, 2) NOT NULL,
    gold_weight NUMERIC(4, 2) NOT NULL,
    liquid_debt_weight NUMERIC(4, 2) NOT NULL,
    rebalance_frequency VARCHAR(20) DEFAULT 'ANNUAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
