import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Zap, ExternalLink, PiggyBank, CreditCard, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Clock, HelpCircle } from 'lucide-react';
import { format_indian_currency } from '../utils/formatters';
import { calculateGoalPlan } from '../utils/financialCalculations';

const PRESET_GOALS = [
  { name: 'MacBook Pro / Tech Upgrade', amount: 180000, months: 10 },
  { name: 'Royal Enfield / Bike', amount: 250000, months: 14 },
  { name: 'Emergency Reserve (6m Living)', amount: 400000, months: 18 },
  { name: 'Wedding / Big Event Fund', amount: 1500000, months: 36 },
  { name: 'Dream Home Down Payment', amount: 3000000, months: 48 },
];

export default function GoalSlicingCard({ userParams }) {
  const [goalName, setGoalName] = useState('Wedding / Big Event Fund');
  const [targetAmount, setTargetAmount] = useState(1500000);
  const [targetMonths, setTargetMonths] = useState(36);
  const [currentSaved, setCurrentSaved] = useState(100000);
  const [stepUpPct, setStepUpPct] = useState(0.15); // 15% Step-up default
  const [stepUpFreq, setStepUpFreq] = useState('ANNUAL'); // 'ANNUAL', 'SEMI_ANNUAL', 'NONE'
  const [goalResult, setGoalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Synchronize with userParams if provided
  useEffect(() => {
    if (userParams) {
      if (userParams.current_portfolio && userParams.current_portfolio > 0) {
        setCurrentSaved(Math.round(userParams.current_portfolio * 0.2)); // 20% earmarked for immediate goals
      }
      if (userParams.annual_step_up_pct !== undefined) {
        setStepUpPct(userParams.annual_step_up_pct);
      }
    }
  }, [userParams]);

  const calculateTargetDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const fetchGoalPlan = async () => {
    setLoading(true);
    const targetDate = calculateTargetDate(targetMonths);
    try {
      const res = await fetch('/api/v1/goals/reverse-emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_name: goalName,
          target_amount: parseFloat(targetAmount) || 100000,
          target_date: targetDate,
          current_saved: parseFloat(currentSaved) || 0,
          step_up_pct: parseFloat(stepUpPct) || 0.10,
          step_up_frequency: stepUpFreq,
          estimated_loan_apr_pct: 14.0
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setGoalResult(data);
      } else {
        // High-precision Client-side Mathematical Fallback
        const fallback = calculateGoalPlan({
          goal_name: goalName,
          target_amount: parseFloat(targetAmount) || 100000,
          target_date: targetDate,
          current_saved: parseFloat(currentSaved) || 0,
          step_up_pct: parseFloat(stepUpPct) || 0.10,
          step_up_frequency: stepUpFreq,
          estimated_loan_apr_pct: 14.0
        });
        setGoalResult(fallback);
      }
    } catch (err) {
      console.warn('Network issue in goal plan, calculating locally:', err);
      const fallback = calculateGoalPlan({
        goal_name: goalName,
        target_amount: parseFloat(targetAmount) || 100000,
        target_date: targetDate,
        current_saved: parseFloat(currentSaved) || 0,
        step_up_pct: parseFloat(stepUpPct) || 0.10,
        step_up_frequency: stepUpFreq,
        estimated_loan_apr_pct: 14.0
      });
      setGoalResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalPlan();
  }, [goalName, targetAmount, targetMonths, currentSaved, stepUpPct, stepUpFreq]);

  const handlePresetSelect = (preset) => {
    setGoalName(preset.name);
    setTargetAmount(preset.amount);
    setTargetMonths(preset.months);
  };

  return (
    <div className="col-span-12 ip-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-1)]">
              Lifestyle Goal Slicer & Step-Up Reverse-EMI Engine
            </h2>
            <p className="text-xs text-[var(--text-3)]">
              Real-world zero-debt cash planning with Annual Step-Up SIPs and budget affordability modeling.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
          Zero-Debt Cash Plan
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-wider">Quick Presets:</span>
        {PRESET_GOALS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
              goalName === p.name 
                ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-medium shadow-sm' 
                : 'bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            {p.name} ({format_indian_currency(p.amount)})
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-xs text-[var(--text-3)] mb-1.5 uppercase font-medium">Goal Name</label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] font-medium"
            placeholder="e.g. Wedding Fund"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-3)] mb-1.5 uppercase font-medium">Target Cost (₹)</label>
          <input
            type="number"
            step="10000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono font-bold text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-3)] mb-1.5 uppercase font-medium">Time Horizon</label>
          <select
            value={targetMonths}
            onChange={(e) => setTargetMonths(parseInt(e.target.value))}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="6">6 Months (Immediate)</option>
            <option value="12">12 Months (1 Year)</option>
            <option value="18">18 Months (1.5 Years)</option>
            <option value="24">24 Months (2 Years)</option>
            <option value="36">36 Months (3 Years)</option>
            <option value="48">48 Months (4 Years)</option>
            <option value="60">60 Months (5 Years)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-3)] mb-1.5 uppercase font-medium">Initial Lump Sum Saved (₹)</label>
          <input
            type="number"
            step="10000"
            value={currentSaved}
            onChange={(e) => setCurrentSaved(e.target.value === '' ? 0 : parseFloat(e.target.value))}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-3)] mb-1.5 uppercase font-medium">Annual SIP Step-Up</label>
          <select
            value={`${stepUpPct}-${stepUpFreq}`}
            onChange={(e) => {
              const [pct, freq] = e.target.value.split('-');
              setStepUpPct(parseFloat(pct));
              setStepUpFreq(freq);
            }}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="0.10-ANNUAL">10% Annual Step-Up</option>
            <option value="0.15-ANNUAL">15% Annual Step-Up</option>
            <option value="0.20-ANNUAL">20% Aggressive Step-Up</option>
            <option value="0.05-SEMI_ANNUAL">5% Semi-Annual Step-Up</option>
            <option value="0.00-NONE">0% (Flat SIP - Harder)</option>
          </select>
        </div>
      </div>

      {/* Sliced Output Result */}
      {goalResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Primary Step-Up Reverse EMI Card */}
            <div className="lg:col-span-6 p-5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-[var(--text-3)] tracking-wider">
                    REALISTIC STARTING MONTHLY SIP ({goalResult.step_up_pct}% STEP-UP)
                  </span>
                  {goalResult.step_up_pct > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-[var(--success)] rounded border border-emerald-500/20">
                      Step-Up Active
                    </span>
                  )}
                </div>

                <h3 className="text-3xl font-black font-mono text-[var(--success)]">
                  {goalResult.formatted_starting_stepup_sip}
                </h3>

                <p className="text-xs text-[var(--text-2)] mt-2 leading-relaxed">
                  Start with <strong>{goalResult.formatted_starting_stepup_sip}</strong> in Year 1 and step up by {goalResult.step_up_pct}% yearly to accumulate <strong>{goalResult.formatted_target}</strong> for {goalResult.goal_name} in {goalResult.years_remaining} years in cash!
                </p>

                {/* Flat vs Step-up Comparison Pill */}
                {goalResult.step_up_pct > 0 && (
                  <div className="mt-3 p-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-3)] flex items-center justify-between">
                    <span>Flat SIP without Step-up would be:</span>
                    <span className="font-mono line-through text-[var(--danger)] font-bold">{goalResult.formatted_flat_sip}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--text-2)]">
                  <span>Total Self Contributions:</span>
                  <span className="font-bold text-[var(--text-1)]">{goalResult.formatted_self_contribution}</span>
                </div>
                <div className="flex justify-between text-[var(--text-2)]">
                  <span>Interest Growth Bonus:</span>
                  <span className="font-bold text-[var(--accent)]">+ {goalResult.formatted_interest_bonus}</span>
                </div>
                <div className="flex justify-between text-[var(--success)] bg-emerald-500/10 px-2.5 py-1 rounded">
                  <span>Interest Saved vs 14% Loan EMI:</span>
                  <span className="font-bold">+{goalResult.formatted_loan_saved}</span>
                </div>
              </div>
            </div>

            {/* Asset Allocation & Horizon Rules */}
            <div className="lg:col-span-6 p-5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full ${
                    goalResult.horizon_category === 'SHORT_TERM'
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30'
                  }`}>
                    {goalResult.horizon_category === 'SHORT_TERM' ? '🛡️ SHORT-TERM (0% EQUITY)' : '📈 MEDIUM-TERM (HYBRID ALLOCATION)'}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-3)]">
                    Target: {goalResult.target_date} ({goalResult.months_remaining}m)
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[var(--text-1)] mt-2">
                  Recommended Asset: {goalResult.recommended_vehicle}
                </h4>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  {goalResult.vehicle_details}
                </p>

                <div className="p-3 rounded-md bg-[var(--surface)] border border-[var(--border)] mt-3">
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">
                    💡 <strong>Horizon Rule:</strong> {goalResult.advisor_verdict}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-3)]">
                  Expected Return: <strong className="text-[var(--text-1)] font-mono">{goalResult.expected_cagr_pct}% CAGR</strong>
                </span>
                <a
                  href={goalResult.groww_deep_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--accent)] hover:opacity-90 text-white font-medium text-xs transition-all shadow-sm"
                >
                  Set SIP on Groww <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

          {/* ── Realistic Budget Affordability Scenarios ── */}
          {goalResult.budget_scenarios && goalResult.budget_scenarios.length > 0 && (
            <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <h4 className="text-xs font-semibold uppercase text-[var(--text-3)] tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                What if {goalResult.formatted_starting_stepup_sip} is too high? Realistic Budget Alternatives
              </h4>
              <p className="text-xs text-[var(--text-3)] mb-3">
                If your current disposable income cannot support {goalResult.formatted_starting_stepup_sip}, here is what different comfortable monthly SIPs achieve:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {goalResult.budget_scenarios.map((sc, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs">
                    <span className="font-mono font-bold text-[var(--accent)] block text-sm">
                      {sc.formatted_affordable_sip}
                    </span>
                    <span className="text-[11px] text-[var(--text-3)] mt-1 block">
                      In {goalResult.months_remaining}m: Builds <strong>{sc.formatted_accumulated}</strong>
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-3)] mt-1 block">
                      Or takes <strong>{sc.years_needed} yrs</strong> for full {goalResult.formatted_target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
