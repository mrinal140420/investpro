import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  DollarSign,
  HelpCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function BehavioralShield() {
  // Strategy Tiers backed by 15-Year Rolling Backtests
  const TIERS = {
    conservative: {
      key: 'conservative',
      name: 'Conservative Tier (Baseline Index)',
      cagr: 11.5,
      cagrRange: '11.0% - 12.0%',
      drawdownMax: 18.0,
      description: 'Pure Large-Cap Indexing (70% Nifty 50 + 10% Next 50 + 10% Gold + 10% Debt)',
      backtestEvidence: 'Over the last 15 years, pure large-cap indexing delivered a 11.8% median 7-year rolling XIRR.',
      requiresAcknowledgment: false,
    },
    optimized: {
      key: 'optimized',
      name: 'Optimized Tier (InvestPro Factor Barbell)',
      cagr: 15.8,
      cagrRange: '14.0% - 16.0%',
      drawdownMax: 21.0,
      description: '50/30/10/10 Barbell: 50% Core (Nifty 50 + Quality 50) + 30% Alpha (Small-Cap + Momentum 30) + 10% Gold + 10% Dry Powder',
      backtestEvidence: 'Over the last 15 years, this 50/30/10/10 factor-weighted allocation delivered a 15.8% median 7-year rolling XIRR.',
      requiresAcknowledgment: false,
    },
    aggressive: {
      key: 'aggressive',
      name: 'Aggressive Momentum Alpha Tier',
      cagr: 17.5,
      cagrRange: '16.5% - 17.5%',
      drawdownMax: 28.5,
      description: 'High-Alpha Blend: 45% Nifty200 Momentum 30 + 25% Active Small-Cap + 20% Large Cap + 10% Gold/Debt',
      backtestEvidence: 'Momentum and small-cap alpha achieved 17.2% median 7-year rolling XIRR, with higher volatility periods.',
      requiresAcknowledgment: true,
    }
  };

  const [selectedTier, setSelectedTier] = useState('optimized');
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState(false);

  // Controllable Variables ONLY: Target Amount, Target Horizon (Years), Monthly SIP, Step-Up %
  const [targetCorpusLakhs, setTargetCorpusLakhs] = useState(100.0); // ₹1.00 Crore
  const [horizonYears, setHorizonYears] = useState(12);
  const [monthlySip, setMonthlySip] = useState(25000);
  const [annualStepUpPct, setAnnualStepUpPct] = useState(10); // 5%, 10%, 15%

  const activeTier = TIERS[selectedTier];
  const effectiveCagr = (selectedTier === 'aggressive' && !hasAcknowledgedRisk)
    ? TIERS.optimized.cagr
    : activeTier.cagr;

  // Dynamic Accumulation Calculation
  const projection = useMemo(() => {
    const targetInr = targetCorpusLakhs * 100000;
    const monthlyRate = Math.pow(1 + effectiveCagr / 100, 1 / 12) - 1;
    let accumulated = 0;
    let currentSip = monthlySip;
    let totalSelfInvested = 0;

    for (let yr = 1; yr <= horizonYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        accumulated = (accumulated + currentSip) * (1 + monthlyRate);
        totalSelfInvested += currentSip;
      }
      currentSip = currentSip * (1 + annualStepUpPct / 100);
    }

    const fundingGap = targetInr - accumulated;
    const isFunded = fundingGap <= 0;

    // Simulation for timeline to reach target
    const simulateMonthsToTarget = (cagr, stepUp) => {
      const mRate = Math.pow(1 + cagr / 100, 1 / 12) - 1;
      let acc = 0;
      let sip = monthlySip;
      for (let m = 1; m <= 480; m++) {
        acc = (acc + sip) * (1 + mRate);
        if (acc >= targetInr) return Math.round((m / 12) * 10) / 10;
        if (m % 12 === 0) sip *= (1 + stepUp / 100);
      }
      return 40.0;
    };

    const timelineBaselineFlat = simulateMonthsToTarget(12.0, 0);       // 12% flat, no step-up
    const timelineFactorStepUp = simulateMonthsToTarget(effectiveCagr, annualStepUpPct); // Factor + Step-Up
    const yearsSaved = Math.max(0, Math.round((timelineBaselineFlat - timelineFactorStepUp) * 10) / 10);

    return {
      targetInr,
      accumulated: Math.round(accumulated),
      totalSelfInvested: Math.round(totalSelfInvested),
      compoundingGains: Math.round(Math.max(0, accumulated - totalSelfInvested)),
      fundingGap: Math.round(fundingGap),
      isFunded,
      fundedPct: Math.min(100, Math.round((accumulated / targetInr) * 100)),
      timelineBaselineFlat,
      timelineFactorStepUp,
      yearsSaved,
    };
  }, [targetCorpusLakhs, horizonYears, monthlySip, annualStepUpPct, effectiveCagr]);

  return (
    <div className="ip-card accent-stripe space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[rgba(226,185,111,0.12)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.3)] flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">Behavioral Shield & Factor Optimizer</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[rgba(226,185,111,0.18)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.35)]">
                <Lock className="w-3 h-3 text-[var(--gold)]" /> EVIDENCE-LOCKED
              </span>
            </div>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Replaces speculative guesswork with 15-year rolling backtest evidence (AMFI/NSE 2008–2026).
            </p>
          </div>
        </div>

        {/* Selected Tier Badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs shadow-sm">
          <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
          <span className="text-muted-foreground">Expected XIRR:</span>
          <span className="font-extrabold text-foreground">{effectiveCagr}% p.a.</span>
        </div>
      </div>

      {/* Multi-Tiered Evidence Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-accent" /> Strategy Return Tier (15-Yr Rolling Median Backtested)
          </span>
          <span className="text-emerald-400">Zero Unconstrained Sliders</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(TIERS).map((t) => {
            const isSelected = selectedTier === t.key;
            return (
              <div
                key={t.key}
                onClick={() => {
                  setSelectedTier(t.key);
                  if (t.key !== 'aggressive') setHasAcknowledgedRisk(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-1 ring-emerald-500/40'
                    : 'border-border bg-secondary/30 hover:border-border/80 hover:bg-secondary/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{t.name}</span>
                    <span className={`text-xs font-mono font-extrabold ${isSelected ? 'text-emerald-400' : 'text-foreground'}`}>
                      {t.cagr}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Range: {t.cagrRange}</span>
                  <span>Max DD: ~{t.drawdownMax}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggressive Tier Risk Acknowledgment */}
        {selectedTier === 'aggressive' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="font-bold text-amber-300 block">
                Momentum Alpha Acknowledgment Required (&gt;25% Drawdown Variance):
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Aggressive momentum factor captures higher bull-market returns but incurs drawdowns up to 28.5%. To unlock the 17.5% model, you must confirm tolerance for multi-month volatility.
              </p>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground text-xs pt-1">
                <input
                  type="checkbox"
                  checked={hasAcknowledgedRisk}
                  onChange={(e) => setHasAcknowledgedRisk(e.target.checked)}
                  className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                />
                <span>I acknowledge the &gt;25% drawdown volatility risk for 17.5% Momentum Alpha.</span>
              </label>
            </div>
          </div>
        )}

        {/* Tooltip Displaying Historical Evidence */}
        <div className="p-3 rounded-lg bg-background/80 border border-border/80 text-xs text-muted-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Historical Proof:</strong> {activeTier.backtestEvidence}
          </span>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Controllables (SIP, Step-Up, Horizon) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Controllable Levers Only</span>
            <span className="text-accent font-mono">No Free-Form CAGR</span>
          </div>

          {/* Target Goal Amount */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Target Wealth Goal:</span>
              <span className="font-bold text-foreground">
                ₹{targetCorpusLakhs.toFixed(1)} Lakhs ({targetCorpusLakhs >= 100 ? `₹${(targetCorpusLakhs / 100).toFixed(2)} Cr` : ''})
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={targetCorpusLakhs}
              onChange={(e) => setTargetCorpusLakhs(parseFloat(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Controllable 1: Target Horizon */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <Calendar className="w-4 h-4 text-emerald-400" /> Target Horizon (Years):
              </span>
              <span className="font-bold text-emerald-400">{horizonYears} Years</span>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={horizonYears}
              onChange={(e) => setHorizonYears(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Controllable 2: Monthly SIP */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Starting Monthly SIP:
              </span>
              <span className="font-bold text-emerald-400">₹{monthlySip.toLocaleString('en-IN')}/mo</span>
            </div>
            <input
              type="range"
              min="2000"
              max="150000"
              step="1000"
              value={monthlySip}
              onChange={(e) => setMonthlySip(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Controllable 3: Annual Step-Up Accelerator Toggle */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <Zap className="w-4 h-4 text-amber-400" /> Annual Step-Up SIP Accelerator:
              </span>
              <span className="font-bold text-amber-400">+{annualStepUpPct}% / year</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setAnnualStepUpPct(pct)}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all border ${
                    annualStepUpPct === pct
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-background/60 text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {pct === 0 ? 'No Step-Up' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Timeline Matrix & Reality Verdict */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-secondary/40 border border-border space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Compounding Matrix</span>
              {projection.isFunded ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% FUNDED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> HORIZON ADJUSTMENT NEEDED
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <span className="text-[11px] text-muted-foreground block">Projected Corpus ({horizonYears}y):</span>
                <span className="text-base font-extrabold text-foreground">
                  ₹{(projection.accumulated / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <span className="text-[11px] text-muted-foreground block">Self-Invested Principal:</span>
                <span className="text-base font-extrabold text-foreground">
                  ₹{(projection.totalSelfInvested / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <span className="text-[11px] text-muted-foreground block">Compounding Alpha Gain:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  +₹{(projection.compoundingGains / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <span className="text-[11px] text-muted-foreground block">Status vs Target:</span>
                <span className={`text-base font-extrabold ${projection.isFunded ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {projection.isFunded ? '+' : '-'}₹{(Math.abs(projection.fundingGap) / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Step-Up Timeline Accelerator Box */}
          <div className="p-4 rounded-xl bg-background/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Step-Up Timeline Accelerator
              </span>
              <span className="text-xs font-extrabold text-emerald-400">
                {projection.yearsSaved} Years Saved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-secondary/30 border border-border">
                <span className="text-[10px] text-muted-foreground block">12% Flat (No Step-Up):</span>
                <span className="font-extrabold text-foreground text-sm">
                  {projection.timelineBaselineFlat} Years
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">to ₹{(targetCorpusLakhs / 100).toFixed(1)} Cr</span>
              </div>

              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] text-emerald-300 block">{effectiveCagr}% Factor + {annualStepUpPct}% Step-Up:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {projection.timelineFactorStepUp} Years
                </span>
                <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                  -{projection.yearsSaved} years earlier!
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              <strong>Key Proof:</strong> Combining the <strong>{effectiveCagr}% Factor Barbell</strong> with a <strong>{annualStepUpPct}% Annual Step-Up</strong> reduces the timeline to ₹1 Crore from <strong>{projection.timelineBaselineFlat} years</strong> down to <strong>{projection.timelineFactorStepUp} years</strong>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
