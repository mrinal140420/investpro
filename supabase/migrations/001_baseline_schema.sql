-- ============================================================================
-- InvestPro — Wealth Command Center: Baseline PostgreSQL Schema
-- Migration: 001_baseline_schema.sql
-- Created: 2026-07-25
-- 
-- DESIGN PRINCIPLES:
--   • All monetary values use NUMERIC — never FLOAT/DOUBLE (IEEE 754 rounding)
--   • NAVs: NUMERIC(18,4)   |  Units: NUMERIC(24,6)  |  Currency: NUMERIC(15,2)
--   • All timestamps use TIMESTAMPTZ (timezone-aware)
--   • RLS enabled on every table — OWASP A01 compliance
--   • Append-only ledger pattern for nav_history (immutable financial data)
--   • Composite indexes on (scheme_code, nav_date) for SMA window queries
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE bucket_type AS ENUM ('anchor', 'accelerator');

CREATE TYPE fund_category AS ENUM (
    'large_cap', 'mid_cap', 'small_cap', 'flexi_cap',
    'multi_cap', 'elss', 'sectoral', 'index',
    'momentum', 'value', 'contra', 'focused',
    'nifty_next_50', 'other'
);

CREATE TYPE plan_type AS ENUM ('direct', 'regular');
CREATE TYPE option_type AS ENUM ('growth', 'idcw_payout', 'idcw_reinvestment');

CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical', 'circuit_breaker');
CREATE TYPE alert_type AS ENUM (
    'sma_death_cross', 'sma_golden_cross',
    'aum_bloat', 'aum_recovery',
    'trajectory_breach', 'career_leverage_needed',
    'sip_pause', 'sip_resume',
    'system'
);

CREATE TYPE directive_action AS ENUM ('buy', 'sell', 'pause_sip', 'resume_sip', 'switch', 'hold');
CREATE TYPE directive_status AS ENUM ('pending', 'sent', 'executed', 'expired', 'cancelled');

CREATE TYPE bloat_status AS ENUM ('healthy', 'warning', 'bloated');

CREATE TYPE sma_signal_type AS ENUM ('death_cross', 'golden_cross', 'neutral');

-- ─────────────────────────────────────────────────────────────────────────────
-- DOMAIN 1: USER & IDENTITY
-- ─────────────────────────────────────────────────────────────────────────────

-- User Profiles: Extended user data linked to Supabase auth.users
CREATE TABLE user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    date_of_birth   DATE NOT NULL,
    current_age     SMALLINT GENERATED ALWAYS AS (
                        EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))
                    ) STORED,
    current_ctc     NUMERIC(15,2) NOT NULL DEFAULT 0,          -- Annual CTC in INR
    monthly_take_home NUMERIC(15,2) NOT NULL DEFAULT 0,        -- Post-tax monthly income
    savings_rate    NUMERIC(5,4) NOT NULL DEFAULT 0.30,         -- % of take-home saved (0.30 = 30%)
    risk_profile    TEXT NOT NULL DEFAULT 'aggressive',
    telegram_chat_id TEXT,                                       -- For directive delivery
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Career Milestones: CTC progression for career leverage calculations
CREATE TABLE career_milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    milestone_date  DATE NOT NULL,
    company_name    TEXT,
    role_title      TEXT NOT NULL,
    annual_ctc      NUMERIC(15,2) NOT NULL,                     -- INR
    monthly_take_home NUMERIC(15,2) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, milestone_date)
);

-- Wealth Targets: Target corpus and deadline
CREATE TABLE wealth_targets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_name     TEXT NOT NULL DEFAULT '₹3 Crore by 30',
    target_corpus   NUMERIC(15,2) NOT NULL,                     -- e.g., 30000000.00 (₹3 Cr)
    target_date     DATE NOT NULL,                               -- Deadline
    current_corpus  NUMERIC(15,2) NOT NULL DEFAULT 0,           -- Updated periodically
    monthly_sip     NUMERIC(15,2) NOT NULL DEFAULT 0,           -- Current total monthly SIP
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    assumed_cagr    NUMERIC(5,4) NOT NULL DEFAULT 0.15,         -- Expected annual return (15%)
    max_acceptable_cagr NUMERIC(5,4) NOT NULL DEFAULT 0.25,     -- Beyond this → career leverage
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wealth_targets_user ON wealth_targets(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- DOMAIN 2: FUND UNIVERSE
-- ─────────────────────────────────────────────────────────────────────────────

-- MF Schemes: Master fund registry
CREATE TABLE mf_schemes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code     TEXT NOT NULL UNIQUE,                        -- AMFI 6-digit code (stored as text)
    isin            TEXT,                                         -- 12-char ISIN (e.g., INF209K01157)
    scheme_name     TEXT NOT NULL,
    fund_house      TEXT NOT NULL,
    scheme_category fund_category NOT NULL DEFAULT 'other',
    plan            plan_type NOT NULL DEFAULT 'direct',
    option          option_type NOT NULL DEFAULT 'growth',
    bucket          bucket_type NOT NULL,                        -- Anchor or Accelerator
    aum_threshold   NUMERIC(15,2) NOT NULL DEFAULT 1000000000000, -- Default ₹10,000 Cr in paisa? No, in INR = 10000,00,00,000
    -- Let's use crores for readability:
    -- Actually store in INR. ₹10,000 Crores = 100,000,000,000 (1e11)
    -- Correcting: NUMERIC(15,2) max is 9,999,999,999,999.99 — sufficient
    bloat_status    bloat_status NOT NULL DEFAULT 'healthy',
    is_tracked      BOOLEAN NOT NULL DEFAULT TRUE,               -- Whether we actively monitor
    inception_date  DATE,
    last_nav        NUMERIC(18,4),                               -- Cached latest NAV
    last_nav_date   DATE,                                        -- Date of cached NAV
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix AUM threshold to use sensible value
-- ₹10,000 Crores = ₹100,000,000,000 = 1e11
-- NUMERIC(15,2) handles up to ~1e13, so 1e11 fits fine
ALTER TABLE mf_schemes 
    ALTER COLUMN aum_threshold SET DEFAULT 100000000000.00;

CREATE INDEX idx_mf_schemes_code ON mf_schemes(scheme_code);
CREATE INDEX idx_mf_schemes_bucket ON mf_schemes(bucket);
CREATE INDEX idx_mf_schemes_category ON mf_schemes(scheme_category);

-- NAV History: Daily NAV records (append-only ledger)
CREATE TABLE nav_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code     TEXT NOT NULL REFERENCES mf_schemes(scheme_code) ON DELETE CASCADE,
    nav_date        DATE NOT NULL,
    nav             NUMERIC(18,4) NOT NULL,                     -- Net Asset Value
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(scheme_code, nav_date)                                -- Idempotent upsert key
);

-- Critical index for SMA window queries
CREATE INDEX idx_nav_history_scheme_date ON nav_history(scheme_code, nav_date ASC);
CREATE INDEX idx_nav_history_date ON nav_history(nav_date DESC);

-- AUM Snapshots: Periodic AUM readings for bloat detection
CREATE TABLE aum_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code     TEXT NOT NULL REFERENCES mf_schemes(scheme_code) ON DELETE CASCADE,
    snapshot_date   DATE NOT NULL,
    aum_in_crores   NUMERIC(12,2) NOT NULL,                     -- AUM in ₹ Crores for readability
    source          TEXT NOT NULL DEFAULT 'amfi',                -- Data source identifier
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(scheme_code, snapshot_date)
);

CREATE INDEX idx_aum_snapshots_scheme ON aum_snapshots(scheme_code, snapshot_date DESC);

-- SMA Signals: Computed crossover events
CREATE TABLE sma_signals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code     TEXT NOT NULL REFERENCES mf_schemes(scheme_code) ON DELETE CASCADE,
    signal_date     DATE NOT NULL,
    sma_50          NUMERIC(18,4),
    sma_200         NUMERIC(18,4),
    signal_type     sma_signal_type NOT NULL DEFAULT 'neutral',
    previous_signal sma_signal_type,                             -- For detecting transitions
    nav_at_signal   NUMERIC(18,4) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(scheme_code, signal_date)
);

CREATE INDEX idx_sma_signals_scheme_date ON sma_signals(scheme_code, signal_date DESC);
CREATE INDEX idx_sma_signals_type ON sma_signals(signal_type) WHERE signal_type != 'neutral';

-- ─────────────────────────────────────────────────────────────────────────────
-- DOMAIN 3: PORTFOLIO & EXECUTION
-- ─────────────────────────────────────────────────────────────────────────────

-- Portfolios: Named portfolio containers
CREATE TABLE portfolios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    portfolio_name  TEXT NOT NULL DEFAULT 'Barbell Core',
    description     TEXT,
    anchor_weight   NUMERIC(5,4) NOT NULL DEFAULT 0.40,         -- 40% target
    accelerator_weight NUMERIC(5,4) NOT NULL DEFAULT 0.60,      -- 60% target
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT weight_sum_check CHECK (anchor_weight + accelerator_weight = 1.0000)
);

CREATE INDEX idx_portfolios_user ON portfolios(user_id);

-- Portfolio Holdings: Current positions
CREATE TABLE portfolio_holdings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    scheme_code     TEXT NOT NULL REFERENCES mf_schemes(scheme_code) ON DELETE RESTRICT,
    bucket          bucket_type NOT NULL,                        -- Redundant but useful for queries
    units           NUMERIC(24,6) NOT NULL DEFAULT 0,            -- Fractional MF units
    avg_nav         NUMERIC(18,4) NOT NULL DEFAULT 0,            -- Weighted average purchase NAV
    invested_amount NUMERIC(15,2) NOT NULL DEFAULT 0,            -- Total amount invested (INR)
    current_value   NUMERIC(15,2) NOT NULL DEFAULT 0,            -- units * latest NAV
    unrealized_pnl  NUMERIC(15,2) NOT NULL DEFAULT 0,            -- current_value - invested_amount
    xirr            NUMERIC(8,4),                                -- Internal rate of return
    last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(portfolio_id, scheme_code)
);

CREATE INDEX idx_holdings_portfolio ON portfolio_holdings(portfolio_id);
CREATE INDEX idx_holdings_bucket ON portfolio_holdings(bucket);

-- SIP Schedules: Active SIP configurations
CREATE TABLE sip_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    scheme_code     TEXT NOT NULL REFERENCES mf_schemes(scheme_code) ON DELETE RESTRICT,
    monthly_amount  NUMERIC(15,2) NOT NULL,                     -- SIP amount in INR
    sip_day         SMALLINT NOT NULL DEFAULT 5,                 -- Day of month (1-28)
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_paused       BOOLEAN NOT NULL DEFAULT FALSE,              -- Circuit breaker can pause
    pause_reason    TEXT,                                         -- Why was it paused
    paused_at       TIMESTAMPTZ,
    start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,                                        -- NULL = indefinite
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sip_day_check CHECK (sip_day BETWEEN 1 AND 28),
    UNIQUE(portfolio_id, scheme_code)
);

CREATE INDEX idx_sip_portfolio ON sip_schedules(portfolio_id);
CREATE INDEX idx_sip_active ON sip_schedules(is_active, is_paused);

-- Trading Directives: Generated buy/sell/pause instructions for Telegram
CREATE TABLE trading_directives (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    portfolio_id    UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    scheme_code     TEXT REFERENCES mf_schemes(scheme_code) ON DELETE SET NULL,
    action          directive_action NOT NULL,
    status          directive_status NOT NULL DEFAULT 'pending',
    amount          NUMERIC(15,2),                               -- Suggested transaction amount
    units           NUMERIC(24,6),                               -- Suggested units (if applicable)
    reason          TEXT NOT NULL,                                -- Human-readable explanation
    trigger_source  TEXT NOT NULL,                                -- 'circuit_breaker', 'bloat_scanner', etc.
    telegram_msg_id TEXT,                                         -- Telegram message ID after sending
    sent_at         TIMESTAMPTZ,
    executed_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_directives_user ON trading_directives(user_id);
CREATE INDEX idx_directives_status ON trading_directives(status) WHERE status = 'pending';
CREATE INDEX idx_directives_created ON trading_directives(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- DOMAIN 4: INTELLIGENCE & AUDIT
-- ─────────────────────────────────────────────────────────────────────────────

-- Alert Log: All system-generated alerts
CREATE TABLE alert_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    scheme_code     TEXT REFERENCES mf_schemes(scheme_code) ON DELETE SET NULL,
    alert_type      alert_type NOT NULL,
    severity        alert_severity NOT NULL,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,                               -- Detailed alert message
    metadata        JSONB DEFAULT '{}',                          -- Flexible payload (SMA values, AUM, etc.)
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alert_log(user_id, created_at DESC);
CREATE INDEX idx_alerts_severity ON alert_log(severity) WHERE severity IN ('critical', 'circuit_breaker');
CREATE INDEX idx_alerts_unread ON alert_log(user_id, is_read) WHERE is_read = FALSE;

-- Ghost Trajectory: Monthly projected vs. actual snapshots
CREATE TABLE ghost_trajectory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id       UUID NOT NULL REFERENCES wealth_targets(id) ON DELETE CASCADE,
    snapshot_month  DATE NOT NULL,                               -- First day of month
    -- Projected values (the "ghost" line)
    projected_corpus NUMERIC(15,2) NOT NULL,                    -- Where you should be
    projected_sip   NUMERIC(15,2) NOT NULL,                     -- SIP needed at assumed CAGR
    required_cagr   NUMERIC(8,4) NOT NULL,                      -- CAGR needed from this point
    -- Actual values
    actual_corpus   NUMERIC(15,2),                              -- Where you actually are
    actual_sip      NUMERIC(15,2),                              -- What you actually invested
    actual_ctc      NUMERIC(15,2),                              -- Your CTC at this snapshot
    -- Career leverage indicators
    is_career_lever_needed BOOLEAN NOT NULL DEFAULT FALSE,      -- TRUE if required CAGR > 25%
    suggested_ctc   NUMERIC(15,2),                              -- CTC jump needed
    suggested_sip   NUMERIC(15,2),                              -- SIP after career jump
    -- Deviation tracking
    corpus_deviation_pct NUMERIC(8,4),                          -- (actual - projected) / projected
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(target_id, snapshot_month)
);

CREATE INDEX idx_trajectory_target ON ghost_trajectory(target_id, snapshot_month ASC);

-- Audit Log: Security audit trail (OWASP A09)
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,                                -- e.g., 'login', 'portfolio.create', 'directive.execute'
    resource_type   TEXT,                                         -- e.g., 'portfolio', 'sip_schedule'
    resource_id     UUID,                                        -- ID of the affected resource
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- MATERIALIZED VIEW: Live SMA Computation
-- Refreshed after each NAV ingestion pipeline run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW mv_sma_latest AS
SELECT
    nh.scheme_code,
    nh.nav_date,
    nh.nav,
    -- 50-Day SMA (strict: NULL until 50 data points exist)
    CASE
        WHEN COUNT(nh.nav) OVER w50 = 50
        THEN AVG(nh.nav) OVER w50
        ELSE NULL
    END AS sma_50,
    -- 200-Day SMA (strict: NULL until 200 data points exist)
    CASE
        WHEN COUNT(nh.nav) OVER w200 = 200
        THEN AVG(nh.nav) OVER w200
        ELSE NULL
    END AS sma_200,
    -- Momentum indicator: SMA_50 vs SMA_200
    CASE
        WHEN COUNT(nh.nav) OVER w50 = 50 AND COUNT(nh.nav) OVER w200 = 200
        THEN CASE
            WHEN AVG(nh.nav) OVER w50 > AVG(nh.nav) OVER w200 THEN 'bullish'
            WHEN AVG(nh.nav) OVER w50 < AVG(nh.nav) OVER w200 THEN 'bearish'
            ELSE 'neutral'
        END
        ELSE 'insufficient_data'
    END AS momentum_status
FROM nav_history nh
WHERE nh.scheme_code IN (SELECT scheme_code FROM mf_schemes WHERE is_tracked = TRUE)
WINDOW
    w50 AS (PARTITION BY nh.scheme_code ORDER BY nh.nav_date ROWS BETWEEN 49 PRECEDING AND CURRENT ROW),
    w200 AS (PARTITION BY nh.scheme_code ORDER BY nh.nav_date ROWS BETWEEN 199 PRECEDING AND CURRENT ROW)
ORDER BY nh.scheme_code, nh.nav_date DESC;

-- Unique index to allow REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_sma_latest ON mv_sma_latest(scheme_code, nav_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on ALL tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE aum_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sma_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_trajectory ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── User-scoped policies (private data) ──────────────────────────────────────

-- user_profiles: Users can only access their own profile
CREATE POLICY "Users manage own profile"
    ON user_profiles FOR ALL TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- career_milestones: Scoped to user
CREATE POLICY "Users manage own career milestones"
    ON career_milestones FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- wealth_targets: Scoped to user
CREATE POLICY "Users manage own wealth targets"
    ON wealth_targets FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- portfolios: Scoped to user
CREATE POLICY "Users manage own portfolios"
    ON portfolios FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- portfolio_holdings: Scoped via portfolio ownership
CREATE POLICY "Users manage own holdings"
    ON portfolio_holdings FOR ALL TO authenticated
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- sip_schedules: Scoped via portfolio ownership
CREATE POLICY "Users manage own SIP schedules"
    ON sip_schedules FOR ALL TO authenticated
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- trading_directives: Scoped to user
CREATE POLICY "Users manage own directives"
    ON trading_directives FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- alert_log: Scoped to user
CREATE POLICY "Users view own alerts"
    ON alert_log FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ghost_trajectory: Scoped via wealth target ownership
CREATE POLICY "Users view own trajectory"
    ON ghost_trajectory FOR ALL TO authenticated
    USING (
        target_id IN (
            SELECT id FROM wealth_targets WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        target_id IN (
            SELECT id FROM wealth_targets WHERE user_id = auth.uid()
        )
    );

-- audit_log: Users can only READ their own audit entries (no write from client)
CREATE POLICY "Users read own audit log"
    ON audit_log FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ── Public reference data policies (read-only for all authenticated users) ──

-- mf_schemes: All authenticated users can read fund data
CREATE POLICY "Authenticated users can read schemes"
    ON mf_schemes FOR SELECT TO authenticated
    USING (TRUE);

-- nav_history: All authenticated users can read NAV data
CREATE POLICY "Authenticated users can read NAV history"
    ON nav_history FOR SELECT TO authenticated
    USING (TRUE);

-- aum_snapshots: All authenticated users can read AUM data
CREATE POLICY "Authenticated users can read AUM snapshots"
    ON aum_snapshots FOR SELECT TO authenticated
    USING (TRUE);

-- sma_signals: All authenticated users can read SMA signals
CREATE POLICY "Authenticated users can read SMA signals"
    ON sma_signals FOR SELECT TO authenticated
    USING (TRUE);

-- ── Service role writes for reference data ──────────────────────────────────
-- Note: The service_role key bypasses RLS entirely.
-- Backend data pipelines (NAV ingestion, AUM scraping) use service_role.
-- No explicit write policies needed for mf_schemes, nav_history, aum_snapshots, sma_signals
-- as service_role handles all writes to these tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON mf_schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON wealth_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sip_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMENTS (Documentation)
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE user_profiles IS 'Extended user identity linked to Supabase auth. Stores age, CTC, risk profile.';
COMMENT ON TABLE career_milestones IS 'CTC progression history for Ghost Trajectory career leverage calculations.';
COMMENT ON TABLE wealth_targets IS 'Target corpus (e.g., ₹3 Crore by Age 30) with current progress tracking.';
COMMENT ON TABLE mf_schemes IS 'Master mutual fund registry with AMFI codes, bucket assignment, bloat status.';
COMMENT ON TABLE nav_history IS 'Immutable daily NAV ledger from AMFI via mftool. Key data for SMA computation.';
COMMENT ON TABLE aum_snapshots IS 'Periodic AUM readings for AUM Bloat Scanner. Stored in ₹ Crores.';
COMMENT ON TABLE sma_signals IS 'Computed 50/200-day SMA crossover events. Drives the Casino Exit Circuit Breaker.';
COMMENT ON TABLE portfolios IS 'Named portfolio containers with Barbell allocation weights (40/60 default).';
COMMENT ON TABLE portfolio_holdings IS 'Current fund positions with units, avg NAV, P&L. One row per fund per portfolio.';
COMMENT ON TABLE sip_schedules IS 'Active SIP configurations. Can be paused by circuit breaker logic.';
COMMENT ON TABLE trading_directives IS 'Generated buy/sell/pause instructions pushed to user via Telegram.';
COMMENT ON TABLE alert_log IS 'All system alerts: circuit breaker, AUM bloat, trajectory breach, career leverage.';
COMMENT ON TABLE ghost_trajectory IS 'Monthly projected vs. actual corpus snapshots for the Ghost Trajectory engine.';
COMMENT ON TABLE audit_log IS 'Security audit trail. OWASP A09 compliance. Append-only.';

COMMENT ON MATERIALIZED VIEW mv_sma_latest IS 'Live SMA computation over tracked funds. Refresh after each NAV pipeline run with: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sma_latest;';
