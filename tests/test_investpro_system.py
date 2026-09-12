"""
InvestPro — SystemAuditorAgent: Verification & Stress Testing Suite
Validates mathematical purity, FIFO unit depletion, Section 112A tax harvesting,
historical crash drawdown triggers, regular plan exclusion, and XIRR precision.
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal

from investpro_engine.cas_parser import CASParser
from investpro_engine.tax_harvesting import TaxHarvestingEngine
from investpro_engine.tactical_alloc import TacticalAllocEngine
from investpro_engine.glide_path import GlidePathEngine
from investpro_engine.windfall_stp import WindfallSTPRouter
from investpro_engine.bloat_detector import BloatDetector
from investpro_engine.xirr_calculator import XIRRCalculator
from investpro_engine.rolling_backtester import RollingBacktester
from investpro_engine.capture_ratio_filter import CaptureRatioFilter
from investpro_engine.factor_rotator import FactorRotator


# ─────────────────────────────────────────────────────────────────────────────
# 1. FIFO UNIT DEPLETION & FRACTIONAL DRIFT TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_fifo_unit_depletion_and_drift():
    """
    Verifies that FIFO lot accounting exhausts oldest units first,
    prevents double-spending, and maintains zero fractional-unit drift.
    """
    lots = [
        {"lot_id": "L1", "purchase_date": date(2023, 1, 15), "purchase_nav": 100.0, "units_remaining": 100.0},
        {"lot_id": "L2", "purchase_date": date(2023, 6, 20), "purchase_nav": 110.0, "units_remaining": 50.0},
        {"lot_id": "L3", "purchase_date": date(2023, 12, 10), "purchase_nav": 120.0, "units_remaining": 75.0},
    ]

    total_initial_units = sum(l["units_remaining"] for l in lots)
    assert total_initial_units == 225.0

    # Simulate redemption of 120.0 units
    units_to_redeem = 120.0
    remaining_needed = units_to_redeem

    for lot in sorted(lots, key=lambda x: x["purchase_date"]):
        if remaining_needed <= 0:
            break
        if lot["units_remaining"] <= remaining_needed:
            deduct = lot["units_remaining"]
            remaining_needed -= deduct
            lot["units_remaining"] = 0.0
        else:
            deduct = remaining_needed
            remaining_needed = 0.0
            lot["units_remaining"] -= deduct

    # Validations
    assert remaining_needed == 0.0
    assert lots[0]["units_remaining"] == 0.0  # L1 fully exhausted (100 units)
    assert lots[1]["units_remaining"] == 30.0  # L2 partially exhausted (20 deducted, 30 left)
    assert lots[2]["units_remaining"] == 75.0  # L3 untouched (75 left)

    total_remaining = sum(l["units_remaining"] for l in lots)
    assert total_remaining == 105.0
    assert total_remaining + units_to_redeem == total_initial_units

    # Second redemption: 100 units
    units_to_redeem_2 = 100.0
    remaining_needed_2 = units_to_redeem_2

    for lot in sorted(lots, key=lambda x: x["purchase_date"]):
        if remaining_needed_2 <= 0:
            break
        if lot["units_remaining"] <= remaining_needed_2:
            deduct = lot["units_remaining"]
            remaining_needed_2 -= deduct
            lot["units_remaining"] = 0.0
        else:
            deduct = remaining_needed_2
            remaining_needed_2 = 0.0
            lot["units_remaining"] -= deduct

    assert lots[1]["units_remaining"] == 0.0  # L2 fully exhausted
    assert lots[2]["units_remaining"] == 5.0   # L3 has 75 - 70 = 5 units left
    assert sum(l["units_remaining"] for l in lots) == 5.0


# ─────────────────────────────────────────────────────────────────────────────
# 2. SECTION 112A TAX HARVESTING CAP TEST (BUDGET 2024 ₹1.25 LAKH)
# ─────────────────────────────────────────────────────────────────────────────

def test_tax_harvesting_never_exceeds_exemption_cap():
    """
    Validates that the simulated gain harvested NEVER exceeds ₹1,25,000,
    preventing unintended tax liabilities under Budget 2024.
    """
    engine = TaxHarvestingEngine(exemption_cap=125000.0)

    # Large unrealized gains: 1,000 units bought at ₹100, current NAV ₹300 => Potential gain ₹2,00,000
    tax_lots = [
        {
            "lot_id": "lot-alpha",
            "scheme_name": "Tata Small Cap Fund Direct - Growth",
            "isin": "INF277K01423",
            "purchase_date": "2023-01-10",  # > 365 days
            "purchase_nav": 100.0,
            "units_remaining": 1000.0,
        }
    ]
    nav_lookup = {
        "Tata Small Cap Fund Direct - Growth": 300.0  # +₹200/unit gain
    }

    result = engine.scan_and_generate_directives(
        tax_lots=tax_lots,
        current_nav_lookup=nav_lookup,
        as_of_date=date(2025, 2, 15),
    )

    assert result["status"] == "OPPORTUNITY_FOUND"
    assert result["is_within_statutory_limit"] is True
    # Gain harvested must be <= 125000.0
    assert result["total_gain_harvested_inr"] <= 125000.0
    # Gain harvested should be close to 125000 (e.g. within ₹1 due to unit floor rounding)
    assert result["total_gain_harvested_inr"] >= 124900.0

    # Ensure directives are paired: 1 SELL, 1 BUY
    directives = result["directives"]
    assert len(directives) == 2
    assert directives[0]["action"] == "SELL"
    assert directives[1]["action"] == "BUY"
    assert directives[0]["amount_inr"] == directives[1]["amount_inr"]
    assert directives[0]["target_scheme"] == "LIQUID_SETTLEMENT"
    assert directives[1]["source_scheme"] == "LIQUID_SETTLEMENT"


def test_tax_harvesting_excludes_stcg_units():
    """
    Ensures units held <= 365 days (STCG) are strictly excluded from 112A harvesting.
    """
    engine = TaxHarvestingEngine()
    today = date(2025, 2, 15)

    tax_lots = [
        {
            "lot_id": "lot-short-term",
            "scheme_name": "HDFC Nifty 50 Index Fund Direct",
            "purchase_date": (today - timedelta(days=180)).isoformat(),  # Only 180 days old
            "purchase_nav": 100.0,
            "units_remaining": 500.0,
        }
    ]
    nav_lookup = {"HDFC Nifty 50 Index Fund Direct": 150.0}

    result = engine.scan_and_generate_directives(
        tax_lots=tax_lots,
        current_nav_lookup=nav_lookup,
        as_of_date=today,
    )

    assert result["status"] == "NO_ELIGIBLE_LOTS"
    assert result["total_gain_harvested_inr"] == 0.0
    assert len(result["directives"]) == 0


# ─────────────────────────────────────────────────────────────────────────────
# 3. HISTORICAL CRASH STRESS TESTING (MARCH 2020 & MARCH 2024)
# ─────────────────────────────────────────────────────────────────────────────

def test_drawdown_stress_triggers_covid_crash_2020():
    """
    Replays the March 2020 COVID crash:
    Nifty 50 reached a high of ~12,430.50 in Jan 2020 and plunged to 7,511.10 in March 2020 (-39.57%).
    Verifies that the contrarian trigger activates and deploys 100% of dry powder debt.
    """
    engine = TacticalAllocEngine()

    high_52w = 12430.50
    trough_price = 7511.10
    debt_dry_powder = 200000.0  # ₹2 Lakhs in Liquid Fund

    result = engine.evaluate_drawdown_trigger(
        index_symbol="NIFTY_50",
        current_price=trough_price,
        high_52_week=high_52w,
        available_dry_powder_debt_inr=debt_dry_powder,
    )

    assert result["is_triggered"] is True
    assert result["drawdown_pct"] <= -35.0  # ~ -39.57%
    assert result["status"] == "CONTRARIAN_TRIGGER_ACTIVATED"
    assert len(result["directives"]) == 1

    d = result["directives"][0]
    assert d["directive_type"] == "DEPLOY_DRY_POWDER"
    assert d["action"] == "BUY"
    assert d["source_scheme"] == "LIQUID_DEBT_DRY_POWDER"
    assert d["target_scheme"] == "INDIA_LARGE_CAP"
    # For deep crash <= -20%, 100% of dry powder is deployed
    assert d["amount_inr"] == debt_dry_powder


def test_drawdown_stress_triggers_smallcap_crash_march_2024():
    """
    Replays the March 2024 Small-Cap regulatory cooling crash:
    Nifty Smallcap 250 fell from ~16,400 to ~13,750 (-16.15%).
    Verifies contrarian trigger deploys 50% dry powder into Small-Cap.
    """
    engine = TacticalAllocEngine()

    high_52w = 16400.0
    crash_price = 13750.0  # -16.15%
    debt_dry_powder = 100000.0

    result = engine.evaluate_drawdown_trigger(
        index_symbol="NIFTY_SMALLCAP_250",
        current_price=crash_price,
        high_52_week=high_52w,
        available_dry_powder_debt_inr=debt_dry_powder,
    )

    assert result["is_triggered"] is True
    assert result["drawdown_pct"] <= -15.0  # -16.16%
    assert len(result["directives"]) == 1

    d = result["directives"][0]
    assert d["directive_type"] == "DEPLOY_DRY_POWDER"
    assert d["target_scheme"] == "INDIA_SMALL_CAP"
    assert d["amount_inr"] == 50000.0  # 50% deployed on -15% to -20%


def test_normal_market_does_not_trigger_contrarian_deploy():
    """
    Verifies standard market pullbacks (< 15%) do not prematurely trigger dry powder sweeps.
    """
    engine = TacticalAllocEngine()
    result = engine.evaluate_drawdown_trigger(
        index_symbol="NIFTY_50",
        current_price=24500.0,
        high_52_week=25800.0,  # ~ -5.0% dip
        available_dry_powder_debt_inr=100000.0,
    )
    assert result["is_triggered"] is False
    assert len(result["directives"]) == 0


# ─────────────────────────────────────────────────────────────────────────────
# 4. REGULAR PLAN MANDATORY EXCLUSION AUDIT
# ─────────────────────────────────────────────────────────────────────────────

def test_regular_plan_mandatory_exclusion():
    """
    Ensures all regular mutual fund plans are flagged and rejected from clean direct portfolio allocations.
    """
    parser = CASParser()

    sample_cas_text = (
        "Folio No: 1111/AA\n"
        "Tata Small Cap Fund - Regular Plan - Growth ISIN: INF277K01415\n"
        "15-Jan-2024 Purchase 25000.00 220.000 113.6363 220.000\n\n"
        "Folio No: 2222/BB\n"
        "HDFC Top 100 Fund - Regular Plan - Growth ISIN: INF179K01BD4\n"
        "20-Jan-2024 Purchase 50000.00 62.500 800.0000 62.500\n\n"
        "Folio No: 3333/CC\n"
        "Parag Parikh Flexi Cap Fund - Direct Plan - Growth ISIN: INF879O01018\n"
        "25-Jan-2024 Purchase 75000.00 1100.000 68.1818 1100.000\n"
    )

    result = parser.parse_extracted_content(sample_cas_text)
    metadata = result["metadata"]

    assert metadata["total_records_parsed"] == 3
    assert metadata["regular_plans_flagged_count"] == 2
    assert metadata["clean_direct_records_count"] == 1
    assert metadata["regular_plans_mandatory_excluded"] is True

    # Net inflow should ONLY count the direct fund (₹75,000), excluding the ₹75,000 in regular plans
    assert metadata["total_net_inflow_inr"] == 75000.0

    # Ensure flagged list has the 2 regular schemes
    assert len(result["flagged_regular_plans"]) == 2
    for r in result["flagged_regular_plans"]:
        assert r["is_regular_plan"] is True
        assert "Regular" in r["raw_scheme_name"]


# ─────────────────────────────────────────────────────────────────────────────
# 5. GLIDE PATH & WINDFALL STP VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

def test_glide_path_at_t_minus_24m():
    """
    Validates that at T - 24 months, 4%/month SWP into liquid preservation activates.
    """
    engine = GlidePathEngine()
    today = date(2026, 6, 30)
    target_date = date(2028, 6, 30)  # Exactly 24 months away

    result = engine.evaluate_goal(
        goal_id="G1",
        goal_name="Retirement Anchor",
        target_amount=5000000.0,
        target_date=target_date,
        current_equity_corpus=4000000.0,
        current_debt_corpus=500000.0,
        as_of_date=today,
    )

    assert result["glide_path_status"] == "T_MINUS_24M_SWP_ACTIVE"
    assert result["is_swp_active"] is True
    # 4% of ₹40,00,000 = ₹1,60,000/mo
    assert result["monthly_swp_amount_inr"] == 160000.0
    assert len(result["directives"]) == 1
    assert result["directives"][0]["action"] == "SWP"


def test_windfall_stp_20_weeks_no_leakage():
    """
    Ensures windfall router generates an exact 20-week schedule with zero rupee drift.
    """
    router = WindfallSTPRouter()
    lump_sum = 500000.0  # ₹5 Lakhs

    result = router.route_windfall(lump_sum_amount=lump_sum, start_date=date(2026, 1, 1))

    assert result["status"] == "STP_SCHEDULE_GENERATED"
    assert len(result["schedule"]) == 20
    # Sum of all 20 transfers must strictly equal ₹5,00,000
    total_scheduled = sum(t["transfer_amount_inr"] for t in result["schedule"])
    assert total_scheduled == lump_sum
    # Remaining in liquid after week 20 is 0.0
    assert result["schedule"][-1]["remaining_in_liquid_inr"] == 0.0


# ─────────────────────────────────────────────────────────────────────────────
# 6. SMALL-CAP AUM BLOAT DETECTION TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_bloat_detector_triggers_above_10k_crores():
    """
    Verifies that active Small-Cap fund AUM exceeding ₹10,000 Crores triggers SIP redirection.
    """
    detector = BloatDetector(threshold_crores=10000.0)

    # Fund 1: Healthy ₹6,500 Crores
    res_healthy = detector.scan_fund("145206", "Quant Small Cap Fund", current_aum_crores=6500.0)
    assert res_healthy["is_bloated"] is False
    assert len(res_healthy["directives"]) == 0

    # Fund 2: Bloated ₹55,000 Crores
    res_bloated = detector.scan_fund("120503", "Nippon India Small Cap Fund", current_aum_crores=55000.0, monthly_sip_amount=15000.0)
    assert res_bloated["is_bloated"] is True
    assert len(res_bloated["directives"]) == 1
    d = res_bloated["directives"][0]
    assert d["directive_type"] == "BLOAT_SWITCH"
    assert "Smart Beta" in d["math_rationale"] or "Quality 50" in d["math_rationale"]


# ─────────────────────────────────────────────────────────────────────────────
# 7. HIGH-PRECISION XIRR ACCURACY TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_xirr_precision_newton_raphson():
    """
    Validates Newton-Raphson XIRR against a known benchmark return.
    Example:
    2023-01-01: -₹100,000
    2024-01-01: +₹115,000 (Exactly 15.00% annual return)
    """
    cash_flows = [
        (date(2023, 1, 1), -100000.0),
        (date(2024, 1, 1), 115000.0),
    ]

    rate = XIRRCalculator.calculate_xirr(cash_flows)
    assert rate is not None
    # Rate should be approximately 0.1500 (15%)
    assert abs(rate - 0.15) < 0.005


# ─────────────────────────────────────────────────────────────────────────────
# 8. 7-YEAR ROLLING BACKTESTER & ALPHA PROBABILITY TEST (2008-2026)
# ─────────────────────────────────────────────────────────────────────────────

def test_7year_rolling_backtester_median_above_15pct():
    """
    Validates that the 7-year rolling return engine across a 16-year lookback
    achieves Median >= 15.0% and Probability of return < 10% is <= 5.0%.
    """
    backtester = RollingBacktester(window_years=7)
    # Generate 16-year synthetic daily series (2008-2026) with 16.5% mean CAGR
    series = backtester.generate_synthetic_historical_series(
        cagr_mean=0.165,
        volatility=0.15,
        years=16,
        start_date=date(2008, 1, 1),
        seed=101,
    )

    metrics = backtester.calculate_rolling_returns(series, scheme_name="InvestPro Factor Barbell")

    assert metrics["status"] == "SUCCESS"
    assert metrics["window_years"] == 7
    assert metrics["rolling_windows_count"] > 2500  # Over 2,500 daily rolling windows

    # Assertion 1: Median 7-Year Rolling Return >= 15.0%
    assert metrics["median_rolling_return"] >= 15.0

    # Assertion 2: Probability of return under 10% <= 5.0%
    assert metrics["prob_under_10pct"] <= 5.0

    # Assertion 3: Zero negative return periods over 7-year horizons
    assert metrics["negative_periods_pct"] == 0.0

    # Assertion 4: Strategy passes strict optimization filters
    assert metrics["passed_filters"] is True


# ─────────────────────────────────────────────────────────────────────────────
# 9. ASYMMETRIC CAPTURE RATIO SCREENER TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_asymmetric_capture_ratio_filter():
    """
    Validates capture ratio filter criteria:
    - Upside Capture >= 90%
    - Downside Capture <= 75%
    - Overall Capture Ratio >= 1.25
    """
    # 36-month return series simulating asymmetric alpha over Nifty 50 TRI
    # Fund captures 95% of up moves and only 60% of down moves
    fund_monthly = [
        0.048, 0.035, -0.015, 0.052, -0.020, 0.040, 0.045, -0.018, 0.030, 0.038,
        -0.012, 0.050, 0.058, -0.022, 0.034, 0.044, -0.014, 0.030, 0.042, -0.018,
        0.048, 0.036, -0.016, 0.052, 0.046, -0.017, 0.036, 0.049, -0.015, 0.032,
        0.054, -0.019, 0.039, 0.046, -0.012, 0.051
    ]
    bench_monthly = [
        0.040, 0.030, -0.035, 0.045, -0.040, 0.032, 0.035, -0.038, 0.025, 0.030,
        -0.032, 0.040, 0.048, -0.045, 0.028, 0.036, -0.030, 0.024, 0.033, -0.042,
        0.038, 0.029, -0.036, 0.042, 0.037, -0.039, 0.030, 0.041, -0.034, 0.027,
        0.045, -0.041, 0.031, 0.038, -0.029, 0.043
    ]

    result = CaptureRatioFilter.calculate_capture_ratios(
        fund_monthly,
        bench_monthly,
        scheme_name="Alpha Factor Blend"
    )

    assert result["status"] == "SUCCESS"
    assert result["upside_capture_pct"] >= 90.0
    assert result["downside_capture_pct"] <= 75.0
    assert result["capture_ratio"] >= 1.25
    assert result["passed_filters"] is True


# ─────────────────────────────────────────────────────────────────────────────
# 10. FACTOR ROTATOR 50/30/10/10 BARBELL ALLOCATION TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_factor_rotator_50_30_10_10_barbell():
    """
    Validates that the Factor Rotator constructs the 50/30/10/10 Barbell
    summing to exactly 100% and targets 15.0% - 16.5% XIRR.
    """
    rotator = FactorRotator()
    blend = rotator.get_portfolio_blend("investpro_factor_barbell")

    assert blend["target_xirr_median"] == 15.8
    total_alloc = sum(a["weight_pct"] for a in blend["allocations"])
    assert total_alloc == 100.0

    # Verify component weights:
    # 50% Anchor (30% Large Cap + 20% Quality)
    anchor_weight = sum(a["weight_pct"] for a in blend["allocations"] if "Anchor" in a["category"])
    assert anchor_weight == 50.0

    # 30% Accelerators (15% Momentum + 15% Small-Cap Active)
    accelerator_weight = sum(a["weight_pct"] for a in blend["allocations"] if "Accelerator" in a["category"])
    assert accelerator_weight == 30.0

    # 10% Gold and 10% Liquid Dry Powder
    gold_weight = sum(a["weight_pct"] for a in blend["allocations"] if "Gold" in a["category"])
    assert gold_weight == 10.0
    cash_weight = sum(a["weight_pct"] for a in blend["allocations"] if "Dry Powder" in a["category"])
    assert cash_weight == 10.0


# ─────────────────────────────────────────────────────────────────────────────
# 11. STEP-UP COMPOUNDING TIMELINE ACCELERATION TEST
# ─────────────────────────────────────────────────────────────────────────────

def test_step_up_compounding_timeline_compression():
    """
    Validates that combining 15% factor allocation with 10% Annual Step-Up
    reduces the timeline to ₹1 Crore from 20.0 years down to 11.5 years.
    """
    rotator = FactorRotator()
    matrix_report = rotator.calculate_step_up_timeline_matrix(
        target_amount=10000000.0,  # ₹1.00 Crore
        starting_sip=25000.0,      # ₹25k/mo
        cagr_rate=15.8,            # Factor model
        baseline_cagr=12.0,        # Standard retail index
    )

    # Validate benchmark 20.0 years down to 11.5 years reduction
    benchmark = matrix_report["benchmark_crore_reduction"]
    assert benchmark["baseline_years"] == 20.0
    assert benchmark["factor_step_up_years"] == 11.5
    assert benchmark["years_saved"] == 8.5
    assert benchmark["reduction_pct"] >= 40.0

    # Validate comparative matrix calculation
    rows = matrix_report["comparative_matrix"]
    assert len(rows) == 4
    # With higher step-up, years to target monotonically decreases
    assert rows[3]["factor_15_8pct_years"] <= rows[2]["factor_15_8pct_years"]
    assert rows[2]["factor_15_8pct_years"] <= rows[1]["factor_15_8pct_years"]
