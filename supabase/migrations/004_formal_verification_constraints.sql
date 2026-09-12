-- ============================================================================
-- Migration: 004_formal_verification_constraints.sql
-- Storage Layer Invariants & Database Integrity Constraints
-- ============================================================================

-- 1. Invariant: Units remaining in tax lots must be strictly non-negative
DO $$ BEGIN
    ALTER TABLE tax_lots_fifo 
        ADD CONSTRAINT positive_units CHECK (units_remaining >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Invariant: Factor model allocations must sum exactly to 100.00%
DO $$ BEGIN
    ALTER TABLE factor_model_portfolios 
        ADD CONSTRAINT sum_to_hundred CHECK (
            large_cap_weight + mid_small_alpha_weight + momentum_factor_weight + gold_weight + liquid_debt_weight = 100.00
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Invariant: System directives must always specify positive amount
DO $$ BEGIN
    ALTER TABLE system_directives 
        ADD CONSTRAINT positive_directive_amount CHECK (amount_inr > 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Invariant: Multi-asset allocation weights must sum strictly to 100.00%
DO $$ BEGIN
    ALTER TABLE portfolios 
        ADD CONSTRAINT allocation_sum_to_hundred CHECK (
            target_india_eq_pct + target_global_eq_pct + target_gold_pct + target_debt_pct = 100.00
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
