import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Utensils,
  Home,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Plus,
  Compass,
  ArrowUpRight,
  Info
} from 'lucide-react';
import {
  DEFAULT_ENVELOPES,
  calculatePayCycleInfo,
  calculateSurplusSweep,
  calculateWindfallSTP,
  parseReceiptOrUpiText,
  getSavedCashflowData,
  saveCashflowData
} from '../utils/cashflowEngine.js';
import { format_indian_currency } from '../utils/formatters.js';

export default function CashflowEnvelopeCard({ userParams, onUpdatePortfolio }) {
  // State
  const [paydayDay, setPaydayDay] = useState(25);
  const [envelopes, setEnvelopes] = useState(() => {
    const saved = getSavedCashflowData();
    return saved?.envelopes || DEFAULT_ENVELOPES;
  });
  const [windfallAmount, setWindfallAmount] = useState(500000);
  const [stpMonths, setStpMonths] = useState(10);
  const [activeStp, setActiveStp] = useState(() => {
    const saved = getSavedCashflowData();
    return saved?.activeStp || null;
  });

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseMode, setExpenseMode] = useState('UPI_PASTE'); // 'UPI_PASTE' | 'MANUAL'
  const [upiText, setUpiText] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMerchant, setManualMerchant] = useState('');
  const [selectedEnvId, setSelectedEnvId] = useState('env_dining');
  const [successToast, setSuccessToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    saveCashflowData({
      paydayDay,
      envelopes,
      activeStp
    });
  }, [paydayDay, envelopes, activeStp]);

  // Derived Calculations
  const payCycle = calculatePayCycleInfo(paydayDay);
  const surplusData = calculateSurplusSweep(envelopes);
  const monthlySalary = (userParams?.current_ctc_lpa ? (userParams.current_ctc_lpa * 100000 / 12) * 0.85 : 65000);
  const stpData = calculateWindfallSTP(windfallAmount, monthlySalary, stpMonths);

  // Handle Quick Add Expense
  const handleLogExpense = (e) => {
    e.preventDefault();
    let amt = 0;
    let envId = selectedEnvId;

    if (expenseMode === 'UPI_PASTE') {
      const parsed = parseReceiptOrUpiText(upiText);
      amt = parsed.amount;
      envId = parsed.suggestedEnvId || selectedEnvId;
    } else {
      amt = parseFloat(manualAmount) || 0;
    }

    if (amt <= 0) return;

    setEnvelopes(prev => prev.map(env => {
      if (env.id === envId) {
        return { ...env, spent: env.spent + amt };
      }
      return env;
    }));

    setSuccessToast(`₹${amt.toLocaleString('en-IN')} logged to envelope successfully!`);
    setTimeout(() => setSuccessToast(null), 3500);
    setIsExpenseModalOpen(false);
    setUpiText('');
    setManualAmount('');
    setManualMerchant('');
  };

  // Handle SurplusSweep Execution
  const handleExecuteSweep = () => {
    if (surplusData.total_surplus <= 0) return;

    // Update parent portfolio balance if callback available
    if (onUpdatePortfolio) {
      onUpdatePortfolio(surplusData.total_surplus);
    }

    // Reset envelopes to new cycle allocations
    setEnvelopes(prev => prev.map(env => ({
      ...env,
      spent: 0
    })));

    setSuccessToast(`🎉 SurplusSweep™ Executed! ₹${surplusData.total_surplus.toLocaleString('en-IN')} deployed into your Barbell portfolio!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Handle Activate Windfall STP
  const handleActivateSTP = () => {
    const newStp = {
      amount: windfallAmount,
      tenure: stpMonths,
      monthlyTransfer: stpData.monthly_transfer_amount,
      liquidInterest: stpData.total_liquid_interest_earned,
      activatedAt: new Date().toISOString(),
      currentMonth: 1,
      targetFunds: stpData.target_funds
    };

    setActiveStp(newStp);
    setSuccessToast(`🛡️ Windfall STP Protocol Activated! ₹${format_indian_currency(windfallAmount)} parked in Liquid Debt. ₹${format_indian_currency(stpData.monthly_transfer_amount)}/mo drip scheduled.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Helper icons
  const getIcon = (name) => {
    switch (name) {
      case 'Home': return <Home className="w-4 h-4 text-indigo-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-pink-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ── SECTION 1: PAYCHECK CYCLE & ENVELOPE LEDGER ── */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-6">
        
        {/* Header & Payday Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[rgba(226,185,111,0.12)] text-[var(--gold)] border border-[rgba(226,185,111,0.25)]">
                <Wallet className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">
                Paycheck-Synced Envelope Ledger (PocketPal Mode)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-2)] max-w-xl">
              Zero bank-linking. Privacy-first envelope budgeting calibrated to Indian Rupees (₹). 
              Envelopes reset on your actual payday, not arbitrary calendar months.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-3)] block">Payday Cadence</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
                <select
                  value={paydayDay}
                  onChange={(e) => setPaydayDay(parseInt(e.target.value))}
                  className="bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] rounded-lg px-2 py-1 outline-none focus:border-[var(--gold)] cursor-pointer"
                >
                  <option value={1}>1st of Month</option>
                  <option value={15}>15th of Month</option>
                  <option value={25}>25th of Month (Standard Corporate)</option>
                  <option value={30}>30th of Month</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="btn-gold flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Pay Cycle Progress Bar */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-1)]">Current Cycle:</span>
              <span className="font-mono text-[var(--accent-bright)]">{payCycle.last_payday} → {payCycle.next_payday}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                {payCycle.days_remaining} Days Remaining Until Payday
              </span>
              <span className="font-mono text-[var(--text-3)]">({payCycle.progress_pct}% Elapsed)</span>
            </div>
          </div>

          <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[var(--gold)] to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${payCycle.progress_pct}%` }}
            />
          </div>
        </div>

        {/* Envelopes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {envelopes.map(env => {
            const remaining = Math.max(0, env.budgeted - env.spent);
            const spentPct = Math.min(100, Math.round((env.spent / env.budgeted) * 100));
            const isNearExhaustion = spentPct >= 85;

            return (
              <div
                key={env.id}
                className="p-4 rounded-xl bg-[var(--surface-2)]/70 border border-[var(--border)] hover:border-[var(--accent-border)] transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      {getIcon(env.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-1)]">{env.name}</h4>
                      <span className="text-[10px] text-[var(--text-3)] font-mono">{env.category}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isNearExhaustion
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {spentPct}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-[var(--text-3)] text-[11px]">Remaining:</span>
                    <span className="font-extrabold text-[var(--text-1)] text-sm">
                      ₹{remaining.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[var(--text-3)]">
                    <span>Spent: ₹{env.spent.toLocaleString('en-IN')}</span>
                    <span>Cap: ₹{env.budgeted.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${spentPct}%`,
                      backgroundColor: isNearExhaustion ? '#f59e0b' : env.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: SURPLUSSWEEP™ PROTOCOL (WEALTH ACCELERATOR) ── */}
      <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-[var(--surface)] via-[var(--surface-2)] to-[var(--surface)] border-2 border-[var(--accent-border)] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[var(--gold)]/10 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">
                  InvestPro SurplusSweep™ Protocol
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Automated Dry Powder Deployment
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-2)] max-w-xl leading-relaxed">
              PocketPal stops at budgeting; InvestPro connects cash flow directly to wealth compounding. 
              On the eve of your next payday, unspent envelope balances are swept directly into your core Barbell Strategy.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--gold)]/40 shadow-lg text-right min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-3)] tracking-wider block">
              Active Unspent Surplus
            </span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-[var(--gold)] block">
              {surplusData.formatted_surplus}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
              Ready to Compound
            </span>
          </div>
        </div>

        {/* Sweep Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {surplusData.barbell_allocation.map((alloc, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--accent-bright)]">
                  {alloc.weight_pct}% Allocation
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--text-1)] block truncate">{alloc.name}</span>
              <span className="text-sm font-mono font-extrabold text-[var(--gold)] block">
                ₹{alloc.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Sweep Action Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
            <Info className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <span>
              At 11:59 PM before payday, unspent envelopes are swept. Or trigger a manual sweep right now.
            </span>
          </div>

          <button
            onClick={handleExecuteSweep}
            disabled={!surplusData.can_sweep}
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <span>Execute SurplusSweep™ Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── SECTION 3: WINDFALL STP RECOMMENDATION ENGINE ── */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">
                  Windfall STP (Systematic Transfer Plan) Recommendation Router
                </h3>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  BehavioralShield Peak Market Timing Defense
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-2)] max-w-2xl leading-relaxed">
              When you receive an annual bonus or windfall (&gt;3x monthly income), sweeping it all into high-beta small caps 
              exposes you to brutal market timing drawdowns. InvestPro structures an optimal Liquid-to-Equity STP.
            </p>
          </div>

          {/* Active STP badge if running */}
          {activeStp && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase block">Active STP Plan</span>
                <span className="text-xs font-mono font-bold text-[var(--text-1)]">
                  ₹{activeStp.monthlyTransfer.toLocaleString('en-IN')}/mo (Month {activeStp.currentMonth}/{activeStp.tenure})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Parameters: Bonus Amount & Tenure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
            <label className="text-xs font-bold text-[var(--text-1)] flex justify-between">
              <span>Simulated Bonus / Windfall Inflow:</span>
              <span className="font-mono text-[var(--gold)] font-bold">{format_indian_currency(windfallAmount)}</span>
            </label>
            <input
              type="range"
              min={100000}
              max={2500000}
              step={50000}
              value={windfallAmount}
              onChange={(e) => setWindfallAmount(parseFloat(e.target.value))}
              className="w-full accent-[var(--gold)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-3)] font-mono">
              <span>₹1 Lakh</span>
              <span>₹10 Lakhs</span>
              <span>₹25 Lakhs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
            <label className="text-xs font-bold text-[var(--text-1)] flex justify-between">
              <span>STP Drip Tenure (Liquid → Equities):</span>
              <span className="font-mono text-indigo-400 font-bold">{stpMonths} Months</span>
            </label>
            <input
              type="range"
              min={3}
              max={18}
              step={1}
              value={stpMonths}
              onChange={(e) => setStpMonths(parseInt(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-3)] font-mono">
              <span>3 Months (Fast)</span>
              <span>10 Months (Optimal)</span>
              <span>18 Months (Conservative)</span>
            </div>
          </div>
        </div>

        {/* Comparison: Lumpsum vs InvestPro STP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Naive Lumpsum */}
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">
                Option A: Immediate Lumpsum (High Timing Risk)
              </h4>
            </div>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Dumping the entire {format_indian_currency(windfallAmount)} into equities today leaves your bonus exposed to a potential 10–15% market pullback at all-time high valuations.
            </p>
            <div className="p-3 rounded-xl bg-[var(--surface)]/80 border border-red-500/15 space-y-1 text-xs">
              <span className="text-[11px] text-[var(--text-3)] block">Potential 10% Drawdown Loss:</span>
              <span className="font-mono font-bold text-red-400 text-sm">
                -₹{Math.round(windfallAmount * 0.10).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Option B: InvestPro Recommended Liquid STP */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Option B: InvestPro Liquid Debt STP (Recommended)
              </h4>
            </div>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Park {format_indian_currency(windfallAmount)} in an overnight Liquid Debt fund earning ~7% YTM, and automatically drip {stpData.formatted_monthly_transfer} per month across {stpMonths} months.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-emerald-500/20">
                <span className="text-[10px] text-[var(--text-3)] block">Liquid Transit Yield:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +{stpData.formatted_interest_earned}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-emerald-500/20">
                <span className="text-[10px] text-[var(--text-3)] block">Risk Mitigation:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">
                  {stpData.volatility_reduction_pct}% Smoother
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Funds Drip Schedule & Action */}
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--text-1)] block">
              Monthly STP Drip Routing ({stpData.formatted_monthly_transfer}/mo):
            </span>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[var(--text-2)]">
              {stpData.target_funds.map((tf, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                  {tf.name}: <strong className="text-[var(--gold)]">₹{tf.monthly_drip.toLocaleString('en-IN')}</strong>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleActivateSTP}
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <span>Activate Windfall STP Protocol</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── EXPENSE LOGGING MODAL ── */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" /> Log Cashflow Expense
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setExpenseMode('UPI_PASTE')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  expenseMode === 'UPI_PASTE' ? 'btn-gold shadow-sm font-bold' : 'text-[var(--text-2)]'
                }`}
              >
                Paste UPI SMS / Receipt
              </button>
              <button
                type="button"
                onClick={() => setExpenseMode('MANUAL')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  expenseMode === 'MANUAL' ? 'btn-gold shadow-sm font-bold' : 'text-[var(--text-2)]'
                }`}
              >
                Manual Entry
              </button>
            </div>

            <form onSubmit={handleLogExpense} className="space-y-4">
              {expenseMode === 'UPI_PASTE' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-1)]">
                    Paste Bank SMS / UPI Confirmation Text:
                  </label>
                  <textarea
                    rows={4}
                    value={upiText}
                    onChange={(e) => setUpiText(e.target.value)}
                    placeholder="e.g. Paid Rs. 650.00 to Zomato via UPI on 08-Oct..."
                    className="w-full p-3 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--gold)] outline-none text-[var(--text-1)] resize-none font-mono"
                  />
                  <span className="text-[10px] text-[var(--text-3)] block">
                    Automatically extracts amount and detects merchants (Zomato, Swiggy, Blinkit, Amazon, etc.).
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-1)]">Amount (₹):</label>
                    <input
                      type="number"
                      placeholder="e.g. 650"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--gold)] outline-none text-[var(--text-1)] font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-1)]">Select Target Envelope:</label>
                    <select
                      value={selectedEnvId}
                      onChange={(e) => setSelectedEnvId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--gold)] outline-none text-[var(--text-1)] cursor-pointer"
                    >
                      {envelopes.map(env => (
                        <option key={env.id} value={env.id}>
                          {env.name} (₹{env.spent} / ₹{env.budgeted})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Deduct from Envelope
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
