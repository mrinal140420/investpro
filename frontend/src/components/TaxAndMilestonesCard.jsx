import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { format_indian_currency } from '../utils/formatters';
import { scanTaxHarvesting, calculateMilestones } from '../utils/financialCalculations';
import { apiFetchTaxHarvesting, apiFetchMilestones } from '../utils/apiClient';

export default function TaxAndMilestonesCard({ currentPortfolio, currentCtcLpa }) {
  const [taxData, setTaxData] = useState(null);
  const [freedomData, setFreedomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTaxAndMilestones = async () => {
    setLoading(true);
    const activePortfolio = currentPortfolio || 500000.0;
    const activeCtc = currentCtcLpa || 12.0;

    try {
      const [tData, fData] = await Promise.all([
        apiFetchTaxHarvesting(activePortfolio),
        apiFetchMilestones(activePortfolio, activeCtc)
      ]);

      setTaxData(tData);
      setFreedomData(fData);
    } catch (err) {
      console.warn('Network issue in tax & milestone data, calculating locally:', err);
      setTaxData(scanTaxHarvesting({ portfolio_value: activePortfolio }));
      setFreedomData(calculateMilestones({
        current_corpus: activePortfolio,
        annual_ctc_lpa: activeCtc
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxAndMilestones();
  }, [currentPortfolio, currentCtcLpa]);

  return (
    <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── 1. Section 112A Annual Tax-Gain Harvesting Card ── */}
      <div className="lg:col-span-6 ip-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--success)]" />
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-1)]">
                  Section 112A Tax-Gain Harvesting Engine
                </h3>
                <p className="text-[11px] text-[var(--text-3)]">
                  Budget 2024 ₹1.25L annual tax-free LTCG exemption optimizer.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
              Tax Alpha
            </span>
          </div>

          {taxData && (
            <div className="space-y-4">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block">
                    HARVESTABLE TAX-FREE GAIN
                  </span>
                  <span className="text-lg font-black font-mono text-[var(--text-1)] mt-0.5 block">
                    {taxData.formatted_harvestable_gain}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block">
                    TAX SAVED (12.5% LTCG)
                  </span>
                  <span className="text-lg font-black font-mono text-[var(--success)] mt-0.5 block">
                    +{taxData.formatted_tax_saved}
                  </span>
                </div>
              </div>

              {/* Strategy Explanation */}
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  💡 <strong>Annual Strategy:</strong> {taxData.strategy_explanation}
                </p>
                <div className="mt-2 text-[11px] font-mono text-[var(--text-3)] flex items-center justify-between">
                  <span>Window: <strong>{taxData.optimal_execution_window}</strong></span>
                  <span className="text-[var(--accent)] font-semibold">Exemption: {taxData.formatted_exemption_limit}/yr</span>
                </div>
              </div>

              {/* Action Directives */}
              <div>
                <span className="text-[11px] uppercase font-mono text-[var(--text-3)] block mb-2 font-semibold">
                  Recommended Paired Switch Directives:
                </span>
                <div className="space-y-2">
                  {taxData.action_directives.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs">
                      <div>
                        <span className="font-medium text-[var(--text-1)] block">{rec.scheme_name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-3)]">Harvest: {rec.formatted_harvest_amount}</span>
                      </div>
                      <a
                        href={rec.groww_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] flex items-center gap-1"
                      >
                        Groww <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. The 1% Daily Freedom Rule & 25x FIRE Card ── */}
      <div className="lg:col-span-6 ip-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-1)]">
                  The "1% Daily Market Rule" & 25x FIRE
                </h3>
                <p className="text-[11px] text-[var(--text-3)]">
                  Financial freedom milestone ladder and daily salary-match tracker.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/10 text-[var(--accent)] border border-cyan-500/20">
              Freedom Index
            </span>
          </div>

          {freedomData && (
            <div className="space-y-4">
              {/* 1% Daily Rule Hero Box */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase text-[var(--text-3)] font-semibold">
                    1% DAILY FREEDOM CORPUS
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">
                    {freedomData.one_pct_daily_rule.progress_pct}% Achieved
                  </span>
                </div>
                <h4 className="text-xl font-bold font-mono text-[var(--text-1)]">
                  {freedomData.one_pct_daily_rule.formatted_target_corpus}
                </h4>
                <p className="text-xs text-[var(--text-3)] mt-1.5 leading-relaxed">
                  {freedomData.one_pct_daily_rule.insight}
                </p>
              </div>

              {/* Milestone Ladder */}
              <div>
                <span className="text-[11px] uppercase font-mono text-[var(--text-3)] block mb-2 font-semibold">
                  Financial Milestone Ladder:
                </span>
                <div className="space-y-1.5">
                  {freedomData.milestone_ladder.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          m.is_achieved ? 'bg-emerald-500 text-white' : 'bg-[var(--surface)] text-[var(--text-3)] border border-[var(--border)]'
                        }`}>
                          {m.is_achieved ? '✓' : idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-[var(--text-1)]">{m.name}</span>
                          <span className="text-[10px] text-[var(--text-3)] ml-2 hidden sm:inline">({m.tagline})</span>
                        </div>
                      </div>
                      <span className={`font-mono text-xs font-bold ${m.is_achieved ? 'text-[var(--success)]' : 'text-[var(--text-3)]'}`}>
                        {m.is_achieved ? '🎯 HIT' : `${m.progress_pct.toFixed(0)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
