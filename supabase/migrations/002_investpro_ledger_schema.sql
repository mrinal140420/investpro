-- ============================================================================
-- Migration: 002_investpro_ledger_schema.sql
-- Autonomous Multi-Agent Build: Database & Ledger Foundation
-- Includes: Schema, Strict FIFO Triggers, and XIRR Cash Flows Materialized View
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. ENUMS ────────────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE asset_class_type AS ENUM (
        'INDIA_LARGE_CAP',
        'INDIA_MID_CAP',
        'INDIA_SMALL_CAP',
        'GLOBAL_EQUITY',
        'GOLD_PRECIOUS',
        'DEBT_LIQUID'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

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
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE directive_type AS ENUM (
        'TRIM_AND_SWEEP',
        'DEPLOY_DRY_POWDER',
        'HARVEST_TAX',
        'STP_TRANSFER',
        'SWP_GLIDE_PATH',
        'BLOAT_SWITCH'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE directive_state AS ENUM (
        'PENDING_APPROVAL',
        'APPROVED',
        'EXECUTED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE glide_path_status AS ENUM (
        'ACCUMULATION',
        'T_MINUS_24M_SWP_ACTIVE',
        'MATURED_PRESERVED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── 2. TABLES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT UNIQUE,
    pan_hash            TEXT UNIQUE,
    full_name           TEXT NOT NULL,
    phone_number        TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL DEFAULT 'Main Family Office Portfolio',
    target_india_eq_pct NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    target_global_eq_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    target_gold_pct     NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    target_debt_pct     NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    drift_tolerance_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    total_valuation     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT allocation_sum_check CHECK (
        target_india_eq_pct + target_global_eq_pct + target_gold_pct + target_debt_pct = 100.00
    )
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

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

CREATE TABLE IF NOT EXISTS market_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date       DATE NOT NULL,
    index_symbol        TEXT NOT NULL,
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
    is_regular_plan     BOOLEAN NOT NULL DEFAULT FALSE,
    asset_class         asset_class_type NOT NULL,
    raw_text_payload    JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_user ON reconciliation_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_folio ON reconciliation_ledger(folio_number);
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON reconciliation_ledger(transaction_date);

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

CREATE TABLE IF NOT EXISTS system_directives (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id        UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    goal_id             UUID REFERENCES goals(id) ON DELETE SET NULL,
    directive_type      directive_type NOT NULL,
    action              TEXT NOT NULL,
    source_scheme       TEXT,
    target_scheme       TEXT,
    amount_inr          NUMERIC(15,2) NOT NULL,
    units_estimated     NUMERIC(24,6),
    rationale_heading   TEXT NOT NULL,
    math_rationale      TEXT NOT NULL,
    urgency             TEXT NOT NULL DEFAULT 'MEDIUM',
    state               directive_state NOT NULL DEFAULT 'PENDING_APPROVAL',
    approved_at         TIMESTAMPTZ,
    executed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_directives_user_state ON system_directives(user_id, state);
CREATE INDEX IF NOT EXISTS idx_directives_created ON system_directives(created_at DESC);

-- ── 3. STRICT FIFO FUNCTIONS & TRIGGERS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION deplete_fifo_units(
    p_user_id UUID,
    p_scheme_name TEXT,
    p_units_to_deplete NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    v_remaining_needed NUMERIC(24,6) := p_units_to_deplete;
    v_lot RECORD;
    v_deduct NUMERIC(24,6);
    v_total_depleted NUMERIC(24,6) := 0;
BEGIN
    IF v_remaining_needed <= 0 THEN
        RETURN 0;
    END IF;

    FOR v_lot IN 
        SELECT lot_id, units_remaining, purchase_date, purchase_nav
        FROM tax_lots_fifo
        WHERE user_id = p_user_id 
          AND scheme_name = p_scheme_name 
          AND units_remaining > 0
        ORDER BY purchase_date ASC, created_at ASC, lot_id ASC
        FOR UPDATE
    LOOP
        IF v_remaining_needed <= 0 THEN
            EXIT;
        END IF;

        IF v_lot.units_remaining <= v_remaining_needed THEN
            v_deduct := v_lot.units_remaining;
            v_remaining_needed := v_remaining_needed - v_deduct;
            v_total_depleted := v_total_depleted + v_deduct;

            UPDATE tax_lots_fifo
            SET units_remaining = 0
            WHERE lot_id = v_lot.lot_id;
        ELSE
            v_deduct := v_remaining_needed;
            v_remaining_needed := 0;
            v_total_depleted := v_total_depleted + v_deduct;

            UPDATE tax_lots_fifo
            SET units_remaining = units_remaining - v_deduct
            WHERE lot_id = v_lot.lot_id;
        END IF;
    END LOOP;

    RETURN v_total_depleted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_reconciliation_to_fifo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type IN ('PURCHASE', 'SIP', 'SWITCH_IN', 'STP_IN', 'DIVIDEND_REINVESTMENT') THEN
        IF NEW.units > 0 THEN
            INSERT INTO tax_lots_fifo (
                user_id,
                reconciliation_id,
                folio_number,
                scheme_name,
                isin,
                asset_class,
                purchase_date,
                purchase_nav,
                units_original,
                units_remaining
            ) VALUES (
                NEW.user_id,
                NEW.id,
                NEW.folio_number,
                NEW.scheme_name,
                NEW.isin,
                NEW.asset_class,
                NEW.transaction_date,
                NEW.nav,
                NEW.units,
                NEW.units
            );
        END IF;
    ELSIF NEW.transaction_type IN ('REDEMPTION', 'SWITCH_OUT', 'SWP', 'STP_OUT') THEN
        IF NEW.units > 0 THEN
            PERFORM deplete_fifo_units(NEW.user_id, NEW.scheme_name, NEW.units);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reconciliation_fifo_sync ON reconciliation_ledger;
CREATE TRIGGER trg_reconciliation_fifo_sync
    AFTER INSERT ON reconciliation_ledger
    FOR EACH ROW
    EXECUTE FUNCTION trg_reconciliation_to_fifo();

CREATE OR REPLACE FUNCTION trg_directive_execution_fifo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.state = 'EXECUTED' AND (OLD.state IS NULL OR OLD.state != 'EXECUTED') THEN
        IF NEW.action IN ('SELL', 'SWITCH', 'SWP') AND NEW.units_estimated IS NOT NULL AND NEW.units_estimated > 0 THEN
            PERFORM deplete_fifo_units(NEW.user_id, NEW.source_scheme, NEW.units_estimated);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directive_fifo_exec ON system_directives;
CREATE TRIGGER trg_directive_fifo_exec
    AFTER UPDATE OF state ON system_directives
    FOR EACH ROW
    EXECUTE FUNCTION trg_directive_execution_fifo();

-- ── 4. MATERIALIZED VIEW & XIRR LEDGER ──────────────────────────────────────

DROP MATERIALIZED VIEW IF EXISTS mv_user_cashflows CASCADE;

CREATE MATERIALIZED VIEW mv_user_cashflows AS
WITH historical_flows AS (
    SELECT
        rl.user_id,
        rl.transaction_date,
        CASE
            WHEN rl.transaction_type IN ('PURCHASE', 'SIP', 'SWITCH_IN', 'STP_IN') 
                THEN -ABS(rl.amount)
            WHEN rl.transaction_type IN ('REDEMPTION', 'SWP', 'SWITCH_OUT', 'STP_OUT', 'DIVIDEND_PAYOUT') 
                THEN ABS(rl.amount)
            ELSE 0.00
        END AS net_amount,
        rl.transaction_type::TEXT AS flow_type,
        rl.scheme_name,
        rl.folio_number
    FROM reconciliation_ledger rl
    WHERE rl.is_regular_plan = FALSE
),
terminal_valuation AS (
    SELECT
        p.user_id,
        CURRENT_DATE AS transaction_date,
        SUM(p.total_valuation) AS net_amount,
        'TERMINAL_VALUATION' AS flow_type,
        'PORTFOLIO_TOTAL' AS scheme_name,
        'ALL_FOLIOS' AS folio_number
    FROM portfolios p
    WHERE p.total_valuation > 0
    GROUP BY p.user_id
)
SELECT 
    gen_random_uuid() AS flow_id,
    user_id,
    transaction_date,
    net_amount,
    flow_type,
    scheme_name,
    folio_number
FROM historical_flows
WHERE net_amount <> 0

UNION ALL

SELECT 
    gen_random_uuid() AS flow_id,
    user_id,
    transaction_date,
    net_amount,
    flow_type,
    scheme_name,
    folio_number
FROM terminal_valuation
ORDER BY user_id, transaction_date ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cashflows_id ON mv_user_cashflows(flow_id);
CREATE INDEX IF NOT EXISTS idx_mv_cashflows_user_date ON mv_user_cashflows(user_id, transaction_date ASC);

CREATE OR REPLACE VIEW v_portfolio_drift_audit AS
SELECT
    p.id AS portfolio_id,
    p.user_id,
    p.name AS portfolio_name,
    aa.asset_class,
    aa.target_pct,
    aa.current_pct,
    aa.drift_pct,
    p.drift_tolerance_pct,
    CASE
        WHEN ABS(aa.drift_pct) >= p.drift_tolerance_pct THEN TRUE
        ELSE FALSE
    END AS requires_rebalancing,
    CASE
        WHEN aa.drift_pct > p.drift_tolerance_pct THEN 'OVERWEIGHT_TRIM'
        WHEN aa.drift_pct < -p.drift_tolerance_pct THEN 'UNDERWEIGHT_SWEEP'
        ELSE 'BALANCED'
    END AS tactical_action
FROM portfolios p
JOIN asset_allocations aa ON p.id = aa.portfolio_id;

-- ── 5. RLS POLICIES ─────────────────────────────────────────────────────────

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
