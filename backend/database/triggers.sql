-- ============================================================================
-- InvestPro — PostgreSQL Triggers: Strict FIFO Tax Lot Depletion
-- File: backend/database/triggers.sql
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNCTION: Strict FIFO Tax Lot Depletion
-- ─────────────────────────────────────────────────────────────────────────────

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

    -- Iterate over active lots sorted strictly by purchase_date ASC, lot_id ASC (FIFO)
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TRIGGER FUNCTION: Sync Reconciliation Ledger with Tax Lots
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trg_reconciliation_to_fifo()
RETURNS TRIGGER AS $$
BEGIN
    -- Inflow: Create a new unexhausted FIFO tax lot
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

    -- Outflow: Strict FIFO depletion of existing lots
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER FUNCTION: Deplete FIFO lots on Directive Execution
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trg_directive_execution_fifo()
RETURNS TRIGGER AS $$
BEGIN
    -- When directive state transitions to EXECUTED and action is a redemption/sell
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
