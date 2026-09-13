import React, { useState } from 'react';
import { ExternalLink, PieChart, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, AlertCircle, Sparkles, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { getEnrichedFundUniverse } from '../utils/financialCalculations';
import { format_indian_currency } from '../utils/formatters';

const STRATEGY_LABELS = {
  global_multi_asset: '🌐 Global Multi-Asset Barbell (15-17% Target XIRR)',
  aggressive:         '🌐 Global Multi-Asset Barbell (15-17% Target XIRR)',
  ultra_aggressive:   '🚀 High-Alpha Tech & Small Cap (17%+ Target XIRR)',
  balanced:           '🛡️ All-Weather Balanced (12-14% Target XIRR)',
};

function getRiskStyle(risk = '') {
  const r = risk.toLowerCase();
  if (r.includes('very high') || r.includes('high')) {
    return {
      color: 'var(--danger)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
    };
  }
  if (r.includes('moderate')) {
    return {
      color: 'var(--warning)',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      border: '1px solid rgba(234, 179, 8, 0.25)',
    };
  }
  return {
    color: 'var(--success)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
  };
}

export default function RecommendedPortfolioCard({ fundUniverse, monthlySip, lumpSum, riskMode = 'global_multi_asset' }) {
  const [expandedFundId, setExpandedFundId] = useState(null);
  const [allocationMode, setAllocationMode] = useState('proportional'); // 'proportional' | 'focused'
  const [focusedFundId, setFocusedFundId] = useState('uti_momentum_30');

  // Dynamic enrichment: If monthlySip prop is provided, calculate real-time rupee splits
  const activeSip = monthlySip || (fundUniverse && fundUniverse.total_monthly_sip) || 25000;
  const activeLump = lumpSum !== undefined ? lumpSum : ((fundUniverse && fundUniverse.total_lump_sum) || 0);
  const activeMode = riskMode || (fundUniverse && fundUniverse.risk_mode) || 'global_multi_asset';

  const enrichedData = getEnrichedFundUniverse(activeSip, activeLump, activeMode, allocationMode, focusedFundId);
  const assets = enrichedData.asset_breakdown || [];
  const weightedCagr = enrichedData.portfolio_weighted_5y_cagr;
  const weightedTer = enrichedData.portfolio_weighted_ter;
  const totalGrowth = enrichedData.formatted_total_annual_growth;
  const strategyLabel = STRATEGY_LABELS[activeMode] || '🌐 Global Multi-Asset Barbell';
  const belowMinCount = enrichedData.below_min_count || 0;

  const toggleExpand = (fundId) => {
    setExpandedFundId(prev => prev === fundId ? null : fundId);
  };

  return (
    <div className="col-span-12 ip-card">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shadow-sm">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-1)]">
                Institutional Mutual Fund Allocator & Empirical Research
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
                100% Direct Plans
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Exact monthly rupee allocations, TER efficiency, 7-year rolling return backtests, and category peer selection rationale.
            </p>
          </div>
        </div>

        {/* Strategy Pill & Key Portfolio Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)] shadow-sm">
            {strategyLabel}
          </span>
        </div>
      </div>

      {/* ── Live Rupee Allocation Summary Banner ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block font-medium">
            Active Monthly SIP
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--text-1)] mt-0.5 block">
            {format_indian_currency(activeSip)}/mo
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block font-medium">
            Weighted 5Y CAGR
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--success)] mt-0.5 block">
            {weightedCagr}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block font-medium">
            Weighted TER (Expense Ratio)
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--accent)] mt-0.5 block">
            {weightedTer}% <span className="text-[10px] font-normal text-[var(--text-3)]">(Direct)</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block font-medium">
            1-Yr Projected Wealth Addition
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--accent)] mt-0.5 block">
            {totalGrowth}
          </span>
        </div>
      </div>

      {/* ── Real-World AMC Minimum Floor Notice & Execution Mode Selector (for SIP < ₹2,500) ── */}
      {activeSip < 2500 && (
        <div className="mb-5 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-1)]">
                Real-World Execution Guide: Standalone AMC SIP Floors
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Budget: {format_indian_currency(activeSip)}/mo
              </span>
            </div>

            {/* Execution Strategy Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setAllocationMode('proportional')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  allocationMode === 'proportional'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                Proportional Slices
              </button>
              <button
                type="button"
                onClick={() => setAllocationMode('focused')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  allocationMode === 'focused'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                Single-Fund Mandate (100%)
              </button>
            </div>
          </div>

          <div className="text-xs text-[var(--text-2)] leading-relaxed space-y-1.5">
            {allocationMode === 'proportional' ? (
              <p>
                <strong>Standalone Reality:</strong> Every fund shown below is an independent legal contract with its AMC. Mutual funds do <strong>not</strong> have platform-level unlock gates—you can buy any fund from Day 1. However, individual AMCs mandate a minimum SIP of <strong>₹100</strong> (e.g. UTI, Tata, HDFC) or <strong>₹500</strong> (Motilal). Slicing {format_indian_currency(activeSip)}/mo into 5 slices produces sub-₹100 amounts that bank NACH mandates will reject.
              </p>
            ) : (
              <div>
                <p>
                  <strong>Focused Mandate Active:</strong> Concentrating your full {format_indian_currency(activeSip)}/mo into a single high-conviction scheme completely satisfies AMC minimums and avoids fractional mandate rejection. Select your preferred scheme:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assets.filter(a => a.amc_min_sip <= activeSip).map(fund => (
                    <button
                      key={fund.id}
                      type="button"
                      onClick={() => setFocusedFundId(fund.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                        focusedFundId === fund.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold shadow-sm'
                          : 'bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {fund.fund_name.split(' ')[0]} {fund.fund_name.split(' ')[1]} (Min ₹{fund.amc_min_sip})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mutual Fund Deep Research Table ── */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] mb-4">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[var(--text-3)] uppercase tracking-wider font-mono text-[11px]">
              <th className="py-3 px-4">Fund & AMFI Code</th>
              <th className="py-3 px-4">Monthly Allocation</th>
              <th className="py-3 px-4">TER (Direct)</th>
              <th className="py-3 px-4">AMC Min SIP</th>
              <th className="py-3 px-4">Min Horizon</th>
              <th className="py-3 px-4">3Y / 5Y / 7Y Rolling</th>
              <th className="py-3 px-4">Downside Shield</th>
              <th className="py-3 px-4 text-center">Category Peer Rationale</th>
              <th className="py-3 px-4 text-right">Execute</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {assets.map((item) => {
              const returns = item.returns || {};
              const isExpanded = expandedFundId === item.id;
              const riskStyle = getRiskStyle(item.risk_level || 'High');
              const isBelowFloor = item.is_below_amc_min;

              return (
                <React.Fragment key={item.id}>
                  <tr 
                    className={`transition-colors cursor-pointer ${
                      isExpanded
                        ? 'bg-[var(--surface-2)]'
                        : 'hover:bg-[var(--surface-2)]'
                    }`}
                    onClick={() => toggleExpand(item.id)}
                  >
                    {/* Fund Name & Role */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-xs block text-[var(--text-1)]">
                        {item.fund_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[var(--text-3)]">
                          AMFI: {item.amfi_code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]">
                          {item.bucket}
                        </span>
                        <span 
                          style={riskStyle} 
                          className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold font-mono"
                        >
                          {item.risk_level}
                        </span>
                      </div>
                    </td>

                    {/* Exact Rupee Allocation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`font-mono font-bold text-sm ${item.allocated_sip > 0 ? 'text-[var(--success)]' : 'text-[var(--text-3)]'}`}>
                          {item.formatted_sip}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-3)]">
                          {item.effective_allocation_pct}% of total SIP
                        </span>
                        {isBelowFloor && (
                          <span className="text-[9px] font-mono font-bold text-rose-400 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Below AMC Min
                          </span>
                        )}
                      </div>
                    </td>

                    {/* TER */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-[var(--text-1)]">
                      {item.ter_pct}%
                    </td>

                    {/* AMC Min SIP Floor */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
                        ≥ ₹{item.amc_min_sip}/mo
                      </span>
                    </td>

                    {/* Min Horizon */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
                        {item.min_horizon}
                      </span>
                    </td>

                    {/* Returns (3Y / 5Y / 7Y Rolling) */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="text-[9px] uppercase text-[var(--text-3)] block">3Y</span>
                          <span className="font-semibold text-[var(--text-1)]">{returns.cagr_3y}%</span>
                        </div>
                        <span className="text-[var(--border)]">/</span>
                        <div>
                          <span className="text-[9px] uppercase text-[var(--text-3)] block">5Y</span>
                          <span className="font-bold text-[var(--success)]">{returns.cagr_5y}%</span>
                        </div>
                        <span className="text-[var(--border)]">/</span>
                        <div>
                          <span className="text-[9px] uppercase text-[var(--text-3)] block">7Y XIRR</span>
                          <span className="font-bold text-[var(--accent)]">{returns.rolling_7y_median_xirr}%</span>
                        </div>
                      </div>
                    </td>

                    {/* Downside Shield */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-1)] font-semibold">
                          Downside: <span className="text-emerald-400 font-bold">{item.downside_capture_pct}%</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-3)]">
                          Upside: {item.upside_capture_pct}% | Ratio: {item.capture_ratio}
                        </span>
                      </div>
                    </td>

                    {/* Peer Comparison Toggle Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all inline-flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--surface-2)] text-[var(--accent)] border-[var(--accent-border)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        <span>Why Chosen</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Groww Direct Execution Link (Always Available Standalone) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={item.groww_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-xs font-mono font-bold text-[var(--success)] transition-all hover:shadow-sm"
                        title="Invest directly on Groww (Zero Commission Direct Plan)"
                      >
                        Groww Direct <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>

                  {/* ── Expandable Drawer: Category Peer Comparison & Deep Research ── */}
                  {isExpanded && (
                    <tr className="bg-[var(--surface-2)]/70">
                      <td colSpan={9} className="p-4 border-t border-b border-[var(--border)]">
                        <div className="rounded-xl p-4 bg-[var(--surface)] border border-[var(--border)] space-y-4">
                          
                          {/* Heading & Summary */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                                <h4 className="text-sm font-bold text-[var(--text-1)]">
                                  Empirical Selection Audit: {item.fund_name}
                                </h4>
                              </div>
                              <p className="text-xs text-[var(--text-2)] mt-0.5">
                                {item.why_chosen_summary}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
                              {item.aum_status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Why this fund was chosen */}
                            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                              <span className="text-[11px] font-mono uppercase text-[var(--success)] font-bold block mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Key Quantitative Drivers
                              </span>
                              <ul className="space-y-1.5 text-xs text-[var(--text-2)]">
                                {item.peer_comparison?.reasons_chosen?.map((reason, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-2">
                                    <span className="text-[var(--accent)] mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Why Category Peers Were Rejected */}
                            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                              <span className="text-[11px] font-mono uppercase text-[var(--danger)] font-bold block mb-2 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Category Peers Evaluated & Rejected
                              </span>
                              <div className="space-y-2 text-xs">
                                {item.peer_comparison?.peers_avoided?.map((peer, pIdx) => (
                                  <div key={pIdx} className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                                    <span className="font-semibold text-[var(--text-1)] block">
                                      ❌ {peer.name}
                                    </span>
                                    <p className="text-[11px] text-[var(--text-3)] mt-0.5 leading-relaxed">
                                      {peer.flaw}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Quant Metrics Bottom Row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-[var(--border)] text-[var(--text-3)]">
                            <div>
                              <span>Benchmark: </span>
                              <strong className="text-[var(--text-1)]">{item.benchmark}</strong>
                            </div>
                            <div>
                              <span>AUM Size: </span>
                              <strong className="text-[var(--text-1)]">₹{item.aum_crores.toLocaleString('en-IN')} Cr</strong>
                            </div>
                            <div>
                              <span>Overall Capture Ratio: </span>
                              <strong className="text-[var(--success)]">{item.capture_ratio}x</strong>
                            </div>
                            <a
                              href={item.groww_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--accent)] font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              Verify Direct NAV on Groww <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer Guidance ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-3)]">
        <p>
          💡 <strong>Standalone Mandates:</strong> Each scheme is an independent contract. You can initiate an SIP on Groww or Zerodha Coin without portfolio-level locks. Direct plans eliminate intermediary distributor commissions (~1.0–1.5%/yr).
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-[var(--text-2)]">Direct Plan Verification Active</span>
        </div>
      </div>

    </div>
  );
}
