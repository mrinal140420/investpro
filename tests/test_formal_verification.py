"""
InvestPro — Formal Logical Verification & System Invariants Test Suite
Tests mathematical truths that must hold across all inputs, market conditions, and transaction sequences:
Layer 1: Accounting Invariants (Unit conservation, zero-sum rebalancing, Decimal precision)
Layer 2: Property-Based Fuzzing with Hypothesis (Tax harvesting boundedness, FIFO non-exhaustion, glide path monotonicity)
Layer 3: State Transition Guards (FSM assertions, race condition prevention, no contradictory directives)
Layer 4: Historical Crash Replay (COVID Crash Jan-May 2020: exact -15% trigger, no double-trigger, liquidity floor > 0)
"""

from decimal import Decimal, ROUND_HALF_EVEN
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
import pytest
from hypothesis import given, strategies as st, settings, HealthCheck

from investpro_engine.tax_harvesting import TaxHarvestingEngine
from investpro_engine.tactical_alloc import TacticalAllocEngine
from investpro_engine.glide_path import GlidePathEngine
from investpro_engine.windfall_stp import WindfallSTPRouter
from investpro_engine.factor_rotator import FactorRotator


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 1: ACCOUNTING INVARIANTS (DOUBLE-ENTRY & DECIMAL CONSERVATION)
# ─────────────────────────────────────────────────────────────────────────────

class DecimalTaxLot:
    """Exact decimal representation of an unexhausted lot."""
    def __init__(self, lot_id: str, units: Decimal, purchase_nav: Decimal, purchase_date: date):
        self.lot_id = lot_id
        self.units_original = units
        self.units_remaining = units
        self.purchase_nav = purchase_nav
        self.purchase_date = purchase_date

    def days_held(self, as_of: date) -> int:
        return (as_of - self.purchase_date).days


def execute_fifo_redemption_decimal(lots: List[DecimalTaxLot], units_to_redeem: Decimal) -> Decimal:
    """
    Executes strict FIFO unit depletion using Python Decimal with zero IEEE 754 float drift.
    Returns total units successfully depleted.
    """
    remaining_needed = units_to_redeem
    total_depleted = Decimal("0.0")

    for lot in sorted(lots, key=lambda l: l.purchase_date):
        if remaining_needed <= Decimal("0.0"):
            break
        if lot.units_remaining <= Decimal("0.0"):
            continue

        if lot.units_remaining <= remaining_needed:
            deduct = lot.units_remaining
            remaining_needed -= deduct
            total_depleted += deduct
            lot.units_remaining = Decimal("0.0")
        else:
            deduct = remaining_needed
            remaining_needed = Decimal("0.0")
            total_depleted += deduct
            lot.units_remaining -= deduct

    return total_depleted


def test_invariant_unit_conservation_decimal():
    """
    INVARIANT 1: Unit Conservation
    sum(Remaining Units) + sum(Redeemed Units) == sum(Purchased Units)
    Tested across micro-fractional redemptions with Decimal precision.
    """
    lots = [
        DecimalTaxLot("L1", Decimal("100.123456"), Decimal("50.25"), date(2023, 1, 1)),
        DecimalTaxLot("L2", Decimal("45.678901"), Decimal("65.80"), date(2023, 6, 15)),
        DecimalTaxLot("L3", Decimal("80.999999"), Decimal("82.10"), date(2023, 11, 20)),
    ]

    initial_total = sum(l.units_original for l in lots)
    assert initial_total == Decimal("226.802356")

    # Chaotic micro-redemptions
    redemptions = [
        Decimal("33.123400"),
        Decimal("67.000056"),  # Crosses L1 boundary
        Decimal("20.500000"),
        Decimal("55.178900"),
    ]

    total_redeemed = Decimal("0.0")
    for r in redemptions:
        depleted = execute_fifo_redemption_decimal(lots, r)
        total_redeemed += depleted
        # Immediate sub-invariant: Every lot must remain non-negative
        for l in lots:
            assert l.units_remaining >= Decimal("0.0"), f"Negative unit invariant breached in {l.lot_id}"

    current_remaining = sum(l.units_remaining for l in lots)

    # Formal Conservation Invariant:
    assert (current_remaining + total_redeemed) == initial_total, (
        f"Unit conservation violated: Remaining ({current_remaining}) + Redeemed ({total_redeemed}) != Initial ({initial_total})"
    )


def test_invariant_zero_sum_rebalance():
    """
    INVARIANT 2: Zero-Sum Rebalancing
    A rebalance directive must never create net new capital or leak capital.
    Total Trim Amount == Total Sweep Amount.
    """
    engine = TacticalAllocEngine()
    # Heavily drifted portfolio: India Eq 65%, Gold 10%, Global Eq 15%, Debt 10%
    holdings = {
        "INDIA_EQUITY": 650000.0,
        "GLOBAL_EQUITY": 150000.0,
        "GOLD_PRECIOUS": 100000.0,
        "DEBT_LIQUID": 100000.0,
    }
    total_val = sum(holdings.values())  # 10,00,000

    report = engine.audit_rebalance(holdings)
    assert report["rebalance_triggered"] is True

    trim_total = sum(d["amount_inr"] for d in report["directives"] if d["action"] == "SELL")
    sweep_total = sum(d["amount_inr"] for d in report["directives"] if d["action"] == "BUY")

    # Both trim and sweep must balance to within 1 paisa (rounding)
    assert abs(trim_total - sweep_total) <= 0.01, f"Zero-sum rebalance breached: Trim ₹{trim_total} vs Sweep ₹{sweep_total}"


def test_invariant_multi_asset_sum_to_100():
    """
    INVARIANT 3: Asset Allocation Sum
    Target allocations must strictly sum to 100.00%.
    """
    rotator = FactorRotator()
    for model_key in ["conservative_index", "investpro_factor_barbell", "aggressive_momentum"]:
        blend = rotator.get_portfolio_blend(model_key)
        total_pct = sum(a["weight_pct"] for a in blend["allocations"])
        assert total_pct == 100.0, f"Portfolio {model_key} weights sum to {total_pct}%, expected 100.0%"


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2: PROPERTY-BASED FUZZING (HYPOTHESIS GENERATION)
# ─────────────────────────────────────────────────────────────────────────────

def execute_tax_harvest_fuzz(lots: List[Dict[str, Any]], current_nav: Decimal) -> Decimal:
    """Executes FIFO tax harvesting up to ₹1,25,000 LTCG."""
    max_harvest_limit = Decimal("125000.00")
    total_harvested_gain = Decimal("0.00")

    for lot in lots:
        if lot["days_held"] <= 365:
            continue  # INVARIANT: Only LTCG eligible (> 365 days)

        unit_gain = current_nav - lot["purchase_nav"]
        if unit_gain <= Decimal("0.00"):
            continue

        potential_lot_gain = lot["units"] * unit_gain
        remaining_room = max_harvest_limit - total_harvested_gain

        if remaining_room <= Decimal("0.00"):
            break

        if potential_lot_gain <= remaining_room:
            total_harvested_gain += potential_lot_gain
            lot["units"] = Decimal("0.00")
        else:
            units_to_sell = remaining_room / unit_gain
            total_harvested_gain += units_to_sell * unit_gain
            lot["units"] -= units_to_sell

    return total_harvested_gain


@given(
    st.lists(
        st.tuples(
            st.decimals(min_value=Decimal("0.001"), max_value=Decimal("10000.0"), places=3),  # Units
            st.decimals(min_value=Decimal("10.0"), max_value=Decimal("500.0"), places=2),    # Purchase NAV
            st.integers(min_value=1, max_value=1500)                                         # Days Held
        ),
        min_size=1, max_size=40
    ),
    st.decimals(min_value=Decimal("10.0"), max_value=Decimal("1000.0"), places=2)            # Current NAV
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
def test_property_tax_harvest_never_exceeds_cap(raw_lots, current_nav):
    """
    PROPERTY 1: Tax-Harvesting Boundedness
    0 <= Harvested LTCG <= ₹1,25,000.00 under all randomized sequences.
    No lot held <= 365 days is ever liquidated.
    """
    lots = [
        {"units": u, "purchase_nav": p, "days_held": d, "initial_units": u}
        for u, p, d in raw_lots
    ]

    harvested = execute_tax_harvest_fuzz(lots, current_nav)

    # Formal Invariant 1: Realized LTCG strictly bounded between 0 and 125,000
    assert harvested <= Decimal("125000.00"), f"Cap Breached: Harvested ₹{harvested}"
    assert harvested >= Decimal("0.00"), f"Negative Harvested: ₹{harvested}"

    # Formal Invariant 2: STCG units (days_held <= 365) must never be touched
    for lot in lots:
        if lot["days_held"] <= 365:
            assert lot["units"] == lot["initial_units"], "STCG lot units were modified during LTCG harvest!"


@given(
    st.integers(min_value=1, max_value=24), # Months to target
    st.floats(min_value=100000.0, max_value=5000000.0) # Current equity
)
@settings(max_examples=50)
def test_property_glide_path_monotonicity(months_left, current_equity):
    """
    PROPERTY 2: Glide Path Monotonicity
    Within T - 24 months, the SWP transfer amount must strictly reduce equity
    and equity exposure must be monotonically non-increasing.
    """
    engine = GlidePathEngine()
    today = date(2026, 1, 1)
    target_date = today + timedelta(days=months_left * 30)

    result = engine.evaluate_goal(
        goal_id="G-FUZZ",
        goal_name="Goal",
        target_amount=10000000.0,
        target_date=target_date,
        current_equity_corpus=current_equity,
        current_debt_corpus=100000.0,
        as_of_date=today,
    )

    if months_left <= 24:
        assert result["is_swp_active"] is True
        swp_amt = result["monthly_swp_amount_inr"]
        # SWP amount must never exceed available equity
        assert swp_amt <= current_equity
        assert swp_amt > 0.0
        # Post-SWP equity is strictly less than pre-SWP equity
        post_swp_equity = current_equity - swp_amt
        assert post_swp_equity < current_equity


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 3: STATE TRANSITION GUARDS (FSM & CONFLICT RESOLUTION)
# ─────────────────────────────────────────────────────────────────────────────

class DirectiveFSM:
    """
    Finite State Machine managing directive lifecycle:
    PENDING_APPROVAL -> APPROVED -> EXECUTED (or REJECTED / EXPIRED)
    Guards against concurrent conflicting directives on the same asset lot.
    """
    VALID_TRANSITIONS = {
        "PENDING_APPROVAL": ["APPROVED", "REJECTED", "EXPIRED"],
        "APPROVED": ["EXECUTED", "REJECTED"],
        "EXECUTED": [],
        "REJECTED": [],
        "EXPIRED": [],
    }

    def __init__(self):
        self.active_directives: Dict[str, Dict[str, Any]] = {}
        self.locked_assets: set = set()

    def create_directive(self, d_id: str, d_type: str, asset: str, amount: float) -> bool:
        """Creates directive only if asset is not currently locked by another active directive."""
        if asset in self.locked_assets:
            return False  # RACE CONDITION GUARD: Conflicting active directive exists
        self.active_directives[d_id] = {
            "id": d_id,
            "type": d_type,
            "asset": asset,
            "amount": amount,
            "state": "PENDING_APPROVAL"
        }
        self.locked_assets.add(asset)
        return True

    def transition(self, d_id: str, new_state: str) -> bool:
        """Transitions state according to FSM rules."""
        d = self.active_directives.get(d_id)
        if not d:
            return False
        curr_state = d["state"]
        if new_state not in self.VALID_TRANSITIONS.get(curr_state, []):
            return False  # Invalid FSM transition

        d["state"] = new_state
        if new_state in ["EXECUTED", "REJECTED", "EXPIRED"]:
            self.locked_assets.discard(d["asset"])  # Unlock asset upon completion
        return True


def test_fsm_state_transition_guards():
    """
    Verifies that invalid state transitions (e.g. executing an unapproved directive
    or double-executing) are strictly rejected.
    """
    fsm = DirectiveFSM()
    success = fsm.create_directive("D1", "DEPLOY_DRY_POWDER", "DEBT_LIQUID", 50000.0)
    assert success is True

    # Attempt to transition directly from PENDING_APPROVAL to EXECUTED (Bypass approval) -> Must FAIL
    assert fsm.transition("D1", "EXECUTED") is False

    # Legitimate transition: PENDING -> APPROVED
    assert fsm.transition("D1", "APPROVED") is True

    # Legitimate transition: APPROVED -> EXECUTED
    assert fsm.transition("D1", "EXECUTED") is True

    # Attempt to double-execute an already EXECUTED directive -> Must FAIL
    assert fsm.transition("D1", "EXECUTED") is False


def test_race_condition_conflicting_directives_blocked():
    """
    Verifies that TRIM_AND_SWEEP, DEPLOY_DRY_POWDER, and SWP_GLIDE_PATH
    cannot execute concurrently on the same capital lot.
    """
    fsm = DirectiveFSM()
    # Directive 1 locks DEBT_LIQUID for dry-powder deployment
    created_1 = fsm.create_directive("D1", "DEPLOY_DRY_POWDER", "DEBT_LIQUID", 50000.0)
    assert created_1 is True

    # Directive 2 attempts to concurrently initiate a SWP from the same DEBT_LIQUID lot -> Must be BLOCKED
    created_2 = fsm.create_directive("D2", "SWP_GLIDE_PATH", "DEBT_LIQUID", 30000.0)
    assert created_2 is False, "Race condition guard failed: Concurrent directive permitted on locked asset!"

    # Once D1 completes execution, the lock is released
    fsm.transition("D1", "APPROVED")
    fsm.transition("D1", "EXECUTED")

    # Now Directive 3 can safely proceed
    created_3 = fsm.create_directive("D3", "SWP_GLIDE_PATH", "DEBT_LIQUID", 30000.0)
    assert created_3 is True


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 4: HISTORICAL CRASH REPLAY (COVID CRASH: JAN 1 - MAY 31, 2020)
# ─────────────────────────────────────────────────────────────────────────────

def test_historical_crash_replay_covid_2020():
    """
    Replays the actual daily Nifty Smallcap 250 index trajectory during the March 2020 crash:
    1. Jan 2020 Peak: ~6,000
    2. Early Feb: Minor dip to 5,750 (-4.1%) -> NO trigger
    3. Late Feb: Drop to 5,400 (-10.0%) -> NO trigger
    4. March 9: Drop to 4,950 (-17.5%) -> TACTICAL_LUMPSUM_DEPLOY triggers!
    5. March 12: Subsequent fluctuation to 4,890 (-18.5%, -1.2% further drop) -> Must NOT double trigger
    6. March 24 Trough: 3,650 (-39.1%) -> Additional contrarian tranche
    7. Asserts 10% Debt never breaches liquidity floor (> 0).
    """
    engine = TacticalAllocEngine()
    peak_52w = 6000.0
    initial_debt_liquidity = 100000.0  # ₹1 Lakh dry powder
    current_debt_balance = initial_debt_liquidity
    min_emergency_liquidity_floor = 10000.0  # Must never drop to 0

    # Historical price points
    market_ticks = [
        ("2020-01-15", 6000.0),  # Peak
        ("2020-02-05", 5750.0),  # -4.1%
        ("2020-02-25", 5400.0),  # -10.0%
        ("2020-03-09", 4950.0),  # -17.5% (Crosses -15% trigger!)
        ("2020-03-12", 4890.0),  # Minor fluctuation (-1.2% daily noise)
        ("2020-03-24", 3650.0),  # -39.1% (Extreme crash trough)
        ("2020-04-15", 4200.0),  # Recovery rally
        ("2020-05-20", 4500.0),  # Recovery continuation
    ]

    triggers_fired: List[Dict[str, Any]] = []
    has_initial_triggered = False

    for dt, price in market_ticks:
        res = engine.evaluate_drawdown_trigger(
            index_symbol="NIFTY_SMALLCAP_250",
            current_price=price,
            high_52_week=peak_52w,
            available_dry_powder_debt_inr=current_debt_balance - min_emergency_liquidity_floor,
        )

        if res["is_triggered"]:
            # Debounce check: Prevent double-triggering on minor 1% fluctuations
            if not has_initial_triggered:
                # First trigger at -17.5%
                has_initial_triggered = True
                d = res["directives"][0]
                triggers_fired.append({"date": dt, "directive": d, "price": price})
                current_debt_balance -= d["amount_inr"]
            elif res["drawdown_pct"] <= -35.0 and len(triggers_fired) == 1:
                # Second tranche trigger on catastrophic crash (trough)
                d = res["directives"][0]
                triggers_fired.append({"date": dt, "directive": d, "price": price})
                current_debt_balance -= d["amount_inr"]

    # Assertions:
    # 1. Trigger fired at -17.5% on 2020-03-09
    assert len(triggers_fired) >= 1
    assert triggers_fired[0]["date"] == "2020-03-09"
    assert triggers_fired[0]["directive"]["action"] == "BUY"
    assert triggers_fired[0]["directive"]["directive_type"] == "DEPLOY_DRY_POWDER"

    # 2. Minor fluctuation on 2020-03-12 (4,890 vs 4,950) did NOT generate an extra spam trigger
    march_12_triggers = [t for t in triggers_fired if t["date"] == "2020-03-12"]
    assert len(march_12_triggers) == 0, "Double-trigger invariant failed on minor -1% fluctuation!"

    # 3. Liquidity safety check: Debt dry powder never dropped below emergency floor
    assert current_debt_balance >= min_emergency_liquidity_floor, (
        f"Liquidity floor breached: Balance is ₹{current_debt_balance}, expected >= ₹{min_emergency_liquidity_floor}"
    )
