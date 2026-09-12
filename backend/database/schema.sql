-- ============================================================================
-- InvestPro — Digital Family Office: Core Ledger Schema
-- File: backend/database/schema.sql & supabase/migrations/002_investpro_ledger_schema.sql
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS FOR DETERMINISTIC RULES & TAXONOMY
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE asset_class_type AS ENUM (
        'INDIA_LARGE_CAP',
        'INDIA_MID_CAP',
        'INDIA_SMALL_CAP',
        'GLOBAL_EQUITY',
        'GOLD_PRECIOUS',
        'DEBT_LIQUID'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cas_tx_type AS ENUM (
        'PURCHASE',
        'SIP',
        'SWITCH_IN',
        'SWITCH_OUT',
        'REDEMPTION',
        'SWP',
        'STP_IN',
        'STP_OUT',
        'DIVIDEND_REINVESTMENT',
        'DIVIDEND_PAYOUT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE directive_type AS ENUM (
        'TRIM_AND_SWEEP',
        'DEPLOY_DRY_POWDER',
        'HARVEST_TAX',
        'STP_TRANSFER',
        'SWP_GLIDE_PATH',
        'BLOAT_SWITCH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE directive_state AS ENUM (
        'PENDING_APPROVAL',
        'APPROVED',
        'EXECUTED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE glide_path_status AS ENUM (
        'ACCUMULATION',
        'T_MINUS_24M_SWP_ACTIVE',
        'MATURED_PRESERVED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USERS & INVESTOR PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT UNIQUE,
    pan_hash            TEXT UNIQUE,                             -- SHA-256 encrypted/hashed for privacy
    full_name           TEXT NOT NULL,
    phone_number        TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PORTFOLIOS (CONTRARIAN 50/20/20/10 MODEL CONTAINER)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL DEFAULT 'Main Family Office Portfolio',
    target_india_eq_pct NUMERIC(5,2) NOT NULL DEFAULT 50.00,    -- 50% India Equity baseline
    target_global_eq_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,   -- 20% Global Equity baseline
    target_gold_pct     NUMERIC(5,2) NOT NULL DEFAULT 20.00,     -- 20% Gold baseline
    target_debt_pct     NUMERIC(5,2) NOT NULL DEFAULT 10.00,     -- 10% Liquid / Debt (Dry Powder)
    drift_tolerance_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,      -- 5% drift threshold
    total_valuation     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT allocation_sum_check CHECK (
        target_india_eq_pct + target_global_eq_pct + target_gold_pct + target_debt_pct = 100.00
    )
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ASSET ALLOCATIONS (LIVE WEIGHTED BALANCE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_allocations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_class         asset_class_type NOT NULL,
    current_value       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    current_pct         NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    target_pct          NUMERIC(5,2) NOT NULL,
    drift_pct           NUMERIC(5,2) GENERATED ALWAYS AS (current_pct - target_pct) STORED,
    last_rebalanced_at  TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(portfolio_id, asset_class)
);

CREATE INDEX IF NOT EXISTS idx_allocations_portfolio ON asset_allocations(portfolio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MARKET SNAPSHOTS (FOR CONTRARIAN DRAWDOWN TRIGGERS)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS market_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date       DATE NOT NULL,
    index_symbol        TEXT NOT NULL,                           -- 'NIFTY_50', 'NIFTY_SMALLCAP_250'
    closing_price       NUMERIC(12,2) NOT NULL,
    high_52_week        NUMERIC(12,2) NOT NULL,
    drawdown_pct        NUMERIC(5,2) GENERATED ALWAYS AS (
                            ((closing_price - high_52_week) / high_52_week) * 100.00
                        ) STORED,
    is_drawdown_trigger BOOLEAN GENERATED ALWAYS AS (
                            ((closing_price - high_52_week) / high_52_week) * 100.00 <= -15.00
                        ) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(index_symbol, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_symbol_date ON market_snapshots(index_symbol, snapshot_date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RECONCILIATION LEDGER (RAW IMPORTED CAS STATEMENT RECORDS)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reconciliation_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_document     TEXT NOT NULL DEFAULT 'CAS_PDF',
    folio_number        TEXT NOT NULL,
    scheme_name         TEXT NOT NULL,
    isin                TEXT,
    transaction_date    DATE NOT NULL,
    transaction_type    cas_tx_type NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    units               NUMERIC(24,6) NOT NULL,
    nav                 NUMERIC(18,4) NOT NULL,
    is_regular_plan     BOOLEAN NOT NULL DEFAULT FALSE,          -- Flagged for 100% exclusion
    asset_class         asset_class_type NOT NULL,
    raw_text_payload    JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_user ON reconciliation_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_folio ON reconciliation_ledger(folio_number);
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON reconciliation_ledger(transaction_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TAX LOTS FIFO (GRANULAR UNIT-LEVEL CAPITAL GAINS TRACKING)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tax_lots_fifo (
    lot_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reconciliation_id   UUID REFERENCES reconciliation_ledger(id) ON DELETE SET NULL,
    folio_number        TEXT NOT NULL,
    scheme_name         TEXT NOT NULL,
    isin                TEXT,
    asset_class         asset_class_type NOT NULL,
    purchase_date       DATE NOT NULL,
    purchase_nav        NUMERIC(18,4) NOT NULL,
    units_original      NUMERIC(24,6) NOT NULL,
    units_remaining     NUMERIC(24,6) NOT NULL,
    is_ltcg_eligible    BOOLEAN GENERATED ALWAYS AS (
                            CURRENT_DATE - purchase_date >= 365
                        ) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT units_check CHECK (units_remaining >= 0 AND units_remaining <= units_original)
);

CREATE INDEX IF NOT EXISTS idx_tax_lots_user_scheme ON tax_lots_fifo(user_id, scheme_name, purchase_date ASC);
CREATE INDEX IF NOT EXISTS idx_tax_lots_remaining ON tax_lots_fifo(user_id, units_remaining) WHERE units_remaining > 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. GOALS (PASSIVE BEHAVIORAL GLIDE PATH CONTROLLER)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS goals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name           TEXT NOT NULL,
    target_amount       NUMERIC(15,2) NOT NULL,
    target_date         DATE NOT NULL,
    current_saved       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    equity_allocation_pct NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    debt_allocation_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    glide_path_status   glide_path_status NOT NULL DEFAULT 'ACCUMULATION',
    months_to_maturity  INTEGER GENERATED ALWAYS AS (
                            GREATEST(0, (EXTRACT(YEAR FROM target_date) - EXTRACT(YEAR FROM CURRENT_DATE)) * 12 + 
                            (EXTRACT(MONTH FROM target_date) - EXTRACT(MONTH FROM CURRENT_DATE)))
                        ) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SYSTEM DIRECTIVES (ACTIONABLE RULES & CONTRARIAN QUEUE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS system_directives (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id        UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    goal_id             UUID REFERENCES goals(id) ON DELETE SET NULL,
    directive_type      directive_type NOT NULL,
    action              TEXT NOT NULL,                           -- 'BUY', 'SELL', 'SWITCH', 'STP'
    source_scheme       TEXT,
    target_scheme       TEXT,
    amount_inr          NUMERIC(15,2) NOT NULL,
    units_estimated     NUMERIC(24,6),
    rationale_heading   TEXT NOT NULL,
    math_rationale      TEXT NOT NULL,                           -- Formula & deterministic trigger reasoning
    urgency             TEXT NOT NULL DEFAULT 'MEDIUM',          -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    state               directive_state NOT NULL DEFAULT 'PENDING_APPROVAL',
    approved_at         TIMESTAMPTZ,
    executed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_directives_user_state ON system_directives(user_id, state);
CREATE INDEX IF NOT EXISTS idx_directives_created ON system_directives(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_lots_fifo ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_directives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can access own user record"
        ON users FOR ALL TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can access own portfolios"
        ON portfolios FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can access own asset allocations"
        ON asset_allocations FOR ALL TO authenticated
        USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()))
        WITH CHECK (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Market snapshots readable by all authenticated"
        ON market_snapshots FOR SELECT TO authenticated
        USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users access own reconciliation ledger"
        ON reconciliation_ledger FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users access own tax lots"
        ON tax_lots_fifo FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users access own goals"
        ON goals FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users access own directives"
        ON system_directives FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;
