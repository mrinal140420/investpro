import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Calendar,
  DollarSign,
  Percent,
  Sparkles,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { calculateSwpSimulation } from '../utils/financialCalculations';
import { format_indian_currency } from '../utils/formatters';

export default function SwpPlannerCard({ userParams }) {
  // Inputs
  const [corpus, setCorpus] = useState(10000000); // Default ₹1.00 Crore
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(50000); // ₹50,000/mo
  const [expectedCagr, setExpectedCagr] = useState(12.0); // 12% default
  const [horizonYears, setHorizonYears] = useState(20);
  const [inflationStepUp, setInflationStepUp] = useState(0); // 0% or 5%
  const [taxSlab, setTaxSlab] = useState(30); // 30% default slab

  // Sync with userParams if portfolio is available
  useEffect(() => {
    if (userParams && userParams.current_portfolio && userParams.current_portfolio > 200000) {
      setCorpus(Math.round(userParams.current_portfolio));
      setMonthlyWithdrawal(Math.max(10000, Math.round((userParams.current_portfolio * 0.05) / 12)));
    }
  }, [userParams]);

  // Quick Presets
  const CORPUS_PRESETS = [
    { label: '₹25 Lakhs', value: 2500000 },
    { label: '₹50 Lakhs', value: 5000000 },
    { label: '₹1.00 Crore', value: 10000000 },
    { label: '₹2.50 Crores', value: 25000000 },
  ];

  // Simulation
  const result = useMemo(() => {
    return calculateSwpSimulation({
      initialCorpus: corpus,
      monthlyWithdrawal: monthlyWithdrawal,
      expectedCagrPct: expectedCagr,
      horizonYears: horizonYears,
      annualInflationPct: inflationStepUp,
      taxSlabPct: taxSlab,
    });
  }, [corpus, monthlyWithdrawal, expectedCagr, horizonYears, inflationStepUp, taxSlab]);

  const withdrawalRate = result.annualWithdrawalRatePct;

  return (
    <div className="ip-card accent-stripe space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.12)] text-[var(--success)] border border-emerald-500/30 flex items-center justify-center shadow-md">
            <TrendingDown className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">
                SWP (Systematic Withdrawal Plan) Cashflow Machine™
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> REVERSE SIP PROTOCOL
              </span>
            </div>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Simulate monthly passive income, stress-test the 4% Safe Withdrawal Rule, and compare Section 112A tax efficiency against Bank FDs.
            </p>
          </div>
        </div>

        {/* Withdrawal Rate Gauge Badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs shadow-sm">
          <span className="text-muted-foreground">Annual Withdrawal Rate:</span>
          <span className={`font-mono font-extrabold ${
            withdrawalRate <= 4.5 ? 'text-emerald-400' : withdrawalRate <= 7.0 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {withdrawalRate}% / year
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Controllables (Corpus, Payout, CAGR, Horizon) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Withdrawal Controls</span>
            <span className="text-emerald-400 font-mono">Real-Time Simulation</span>
          </div>

          {/* Quick Corpus Presets */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Quick Corpus Presets:</span>
              {userParams?.current_portfolio > 0 && (
                <button
                  type="button"
                  onClick={() => setCorpus(Math.round(userParams.current_portfolio))}
                  className="text-[10px] font-mono font-bold text-emerald-400 underline hover:opacity-80"
                >
                  Use My MFCentral Portfolio ({format_indian_currency(userParams.current_portfolio)})
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CORPUS_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setCorpus(p.value)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                    corpus === p.value
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Corpus Slider */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Starting Retirement Corpus:
              </span>
              <span className="font-mono font-bold text-emerald-400">{format_indian_currency(corpus)}</span>
            </div>
            <input
              type="range"
              min="1000000"
              max="50000000"
              step="500000"
              value={corpus}
              onChange={(e) => setCorpus(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Monthly SWP Withdrawal Amount */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <TrendingDown className="w-4 h-4 text-emerald-400" /> Monthly SWP Payout:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{monthlyWithdrawal.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="300000"
              step="2500"
              value={monthlyWithdrawal}
              onChange={(e) => setMonthlyWithdrawal(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>Annual Outflow: ₹{(monthlyWithdrawal * 12).toLocaleString('en-IN')}/yr</span>
              <span className={withdrawalRate <= 4.5 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {withdrawalRate}% of Corpus ({withdrawalRate <= 4.5 ? 'Trinity Safe' : 'Higher Depletion Risk'})
              </span>
            </div>
          </div>

          {/* Expected Portfolio Return (CAGR) */}
          <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Portfolio Growth Rate (CAGR):
              </span>
              <span className="font-mono font-bold text-emerald-400">{expectedCagr}% p.a.</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '8% Debt/Hybrid', val: 8.0 },
                { label: '10% Conservative', val: 10.0 },
                { label: '12% Nifty 50', val: 12.0 },
                { label: '15.8% Factor Barbell', val: 15.8 },
              ].map((tier, idx) => (
                <button
                  key={idx}
                  onClick={() => setExpectedCagr(tier.val)}
                  className={`py-1.5 px-1 text-[11px] font-bold rounded-md transition-all border text-center ${
                    expectedCagr === tier.val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-background/60 text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon & Inflation Step-Up */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">Horizon (Years):</span>
                <span className="font-bold text-emerald-400">{horizonYears} Yrs</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={horizonYears}
                onChange={(e) => setHorizonYears(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-2 p-3.5 rounded-lg bg-secondary/30 border border-border">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">Annual Inflation Hike:</span>
                <span className="font-bold text-amber-400">+{inflationStepUp}%/yr</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[0, 4, 6].map((inf) => (
                  <button
                    key={inf}
                    onClick={() => setInflationStepUp(inf)}
                    className={`py-1 text-[10px] font-bold rounded border ${
                      inflationStepUp === inf
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-background/60 text-muted-foreground border-border'
                    }`}
                  >
                    {inf === 0 ? 'Flat' : `+${inf}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Longevity Verdict & Compounding Mechanics */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-secondary/40 border border-border space-y-5">
          <div>
            {/* Sustainability Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Corpus Longevity Verdict</span>
              {result.sustainabilityStatus === 'PERPETUAL' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> PERPETUAL WEALTH (GROWTH &gt; SWP)
                </span>
              )}
              {result.sustainabilityStatus === 'SUSTAINABLE' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> SUSTAINABLE FOR {horizonYears} YEARS
                </span>
              )}
              {result.sustainabilityStatus === 'MODERATE' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> MODERATE PRINCIPAL EROSION
                </span>
              )}
              {result.sustainabilityStatus === 'DEPLETION_RISK' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> DEPLETION IN YEAR {result.depletionYear}!
                </span>
              )}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <span className="text-[11px] text-muted-foreground block">Total Cashflow Withdrawn:</span>
                <span className="text-base font-extrabold text-foreground">
                  {format_indian_currency(result.totalWithdrawn)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <span className="text-[11px] text-muted-foreground block">Closing Corpus Balance:</span>
                <span className={`text-base font-extrabold ${result.finalCorpus > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {format_indian_currency(result.finalCorpus)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <span className="text-[11px] text-muted-foreground block">Internal Compounding Growth:</span>
                <span className="text-base font-extrabold text-foreground">
                  +{format_indian_currency(result.totalGrowthGenerated)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 block">Section 112A Tax Saved vs FD:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  +{format_indian_currency(result.taxSavedVsFd)}
                </span>
              </div>
            </div>
          </div>

          {/* 💡 Tax Advantage Deep Dive Box */}
          <div className="p-4 rounded-xl bg-background/80 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Bank FD vs Mutual Fund SWP Tax Shield
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {taxSlab}% Slab Comparison
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If you took this exact monthly income via <strong>Bank FD interest</strong>, you would have paid <strong>{format_indian_currency(result.fdTaxPaid)}</strong> in taxes because 100% of FD interest is taxed at your slab. 
              With <strong>Mutual Fund SWP</strong>, principal is returned tax-free and only capital gains portion is taxed under Section 112A (with ₹1.25L exemption), leaving you with <strong>{format_indian_currency(result.taxSavedVsFd)} extra in hand</strong>!
            </p>
          </div>

          {/* 🛡️ The 2-Year Liquid Buffer Protocol */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fiduciary Rule: The 2-Year Liquid Buffer (Bucket Strategy)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Never execute SWP directly from volatile equity funds! Keep <strong>2 years of expenses (~₹{(monthlyWithdrawal * 24).toLocaleString('en-IN')})</strong> in an Arbitrage/Liquid fund. Run your monthly SWP from that liquid fund. During bear markets, let equity recover untouched without suffering "Reverse Dollar-Cost Averaging".
            </p>
          </div>
        </div>
      </div>

      {/* ── Yearly Schedule Breakdown (Expandable / Preview) ── */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          5-Year Cashflow & Residual Corpus Trajectory
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {result.yearlySchedule.slice(0, 5).map((row) => (
            <div key={row.year} className="p-3 rounded-lg bg-background/80 border border-border text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Year {row.year}</span>
                <span className="text-[10px] text-muted-foreground">₹{row.monthlyWithdrawal.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Withdrawn: <strong className="text-foreground">₹{(row.annualWithdrawn / 100000).toFixed(2)}L</strong>
              </div>
              <div className="mt-1 text-[11px] text-emerald-400">
                Corpus: <strong className="font-mono">₹{(row.closingCorpus / 100000).toFixed(2)}L</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
