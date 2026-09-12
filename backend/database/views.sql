-- ============================================================================
-- InvestPro — Database Views: XIRR Cash Flow Materialized View
-- File: backend/database/views.sql
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. MATERIALIZED VIEW: User Cash Flows for High-Precision XIRR Computation
-- Negative for Cash Inflows (Investments / Purchases),
-- Positive for Outflows (Redemptions, SWPs) and Current Terminal Valuation
-- ─────────────────────────────────────────────────────────────────────────────

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
    WHERE rl.is_regular_plan = FALSE -- Mandatory exclusion of regular plans
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

-- Create unique index to support CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cashflows_id ON mv_user_cashflows(flow_id);
CREATE INDEX IF NOT EXISTS idx_mv_cashflows_user_date ON mv_user_cashflows(user_id, transaction_date ASC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. HELPER VIEW: Asset Allocation Drift Summary View
-- ─────────────────────────────────────────────────────────────────────────────

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
