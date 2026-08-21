import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, ShieldCheck, Zap, ExternalLink, Award, 
  BarChart3, Activity, PieChart, Layers, ArrowUpRight, CheckCircle2, AlertCircle, Search
} from 'lucide-react';
import { format_indian_currency } from '../utils/formatters';

export default function InvestingProTerminal() {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [fairValueSymbol, setFairValueSymbol] = useState('NIFTY_50');
  const [fairValueData, setFairValueData] = useState(null);
  const [whales, setWhales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ProPicks, Fair Value, and Whale portfolios
  useEffect(() => {
    const fetchProData = async () => {
      setLoading(true);
      try {
        const [propicksRes, fvRes, whalesRes] = await Promise.all([
          fetch('/api/v1/pro/propicks'),
          fetch(`/api/v1/pro/fair-value?symbol=${fairValueSymbol}`),
          fetch('/api/v1/pro/whale-portfolios')
        ]);

        if (propicksRes.ok) {
          const pData = await propicksRes.json();
          setStrategies(pData.strategies || []);
          if (!selectedStrategy && pData.strategies?.length > 0) {
            setSelectedStrategy(pData.strategies[0]);
          }
        }

        if (fvRes.ok) {
          setFairValueData(await fvRes.json());
        }

        if (whalesRes.ok) {
          const wData = await whalesRes.json();
          setWhales(wData.whales || []);
        }
      } catch (err) {
        console.error('Failed to fetch InvestingPro data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProData();
  }, [fairValueSymbol]);

  return (
    <div className="col-span-12 space-y-6">
      
      {/* ── 1. InvestingPro Institutional Banner & Ticker Tape ── */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0d1424] via-[#111c35] to-[#0a1120] border border-cyan-500/30 shadow-lg text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
              PRO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                  InvestingPro™ Institutional Terminal
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded">
                  AI ALPHA ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional-grade ProPicks AI strategies, multi-model Fair Value calculations, and 5-pillar Financial Health scores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">NIFTY 50:</span>
              <span className="font-bold text-emerald-400">24,850.00 (+0.65%)</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 hidden sm:flex items-center gap-2">
              <span className="text-slate-300">INDIA VIX:</span>
              <span className="font-bold text-cyan-400">13.20 (-2.4%)</span>
            </div>
          </div>
        </div>

        {/* Pro Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">TOP PROPICK 5Y CAGR</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-0.5 block">+29.4% / yr</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">ALPHA VS BENCHMARK</span>
            <span className="text-xl font-black font-mono text-cyan-400 mt-0.5 block">+17.2% Beat</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">VALUATION MODELS</span>
            <span className="text-xl font-black font-mono text-amber-400 mt-0.5 block">12 DCF & Multiples</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">AVERAGE SHARPE RATIO</span>
            <span className="text-xl font-black font-mono text-indigo-300 mt-0.5 block">1.52 (High Alpha)</span>
          </div>
        </div>
      </div>

      {/* ── 2. ProPicks AI Market-Beating Strategies ── */}
      <div className="ip-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-semibold text-[var(--text-1)]">
                ProPicks AI — Outperforming Model Portfolios
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Curated algorithmic strategies designed to systematically beat the benchmark using machine-learning factor models.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
            ProPicks AI
          </span>
        </div>

        {/* Strategy Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {strategies.map((strat) => (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategy(strat)}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                selectedStrategy?.id === strat.id
                  ? 'bg-[var(--surface-2)] border-[var(--accent)] shadow-md ring-1 ring-[var(--accent)]'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
                  {strat.badge}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--success)]">
                  +{strat.cagr_5y_pct}% 5Y CAGR
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-1)] mt-1">{strat.name}</h3>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5 line-clamp-1">{strat.tagline}</p>
            </button>
          ))}
        </div>

        {/* Selected Strategy Deep Dive */}
        {selectedStrategy && (
          <div className="p-5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-1)] flex items-center gap-2">
                  {selectedStrategy.name}
                  <span className="text-xs font-mono font-normal text-[var(--text-3)]">
                    ({selectedStrategy.rebalance_cadence} Rebalance • {selectedStrategy.holdings_count} Holdings)
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-2)] mt-1">{selectedStrategy.strategy_thesis}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-3)] block">BEATS BENCHMARK BY</span>
                  <span className="text-lg font-black font-mono text-[var(--success)]">+{selectedStrategy.benchmark_beat_pct}% Alpha</span>
                </div>
              </div>
            </div>

            {/* Strategy Holdings Table */}
            <div>
              <span className="text-xs uppercase font-mono text-[var(--text-3)] font-semibold block mb-2">
                Curated Asset Allocation & Holdings:
              </span>
              <div className="space-y-2">
                {selectedStrategy.top_holdings.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)]">
                        {h.weight}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--text-1)] block">{h.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-3)]">AMFI: {h.amfi} • 5Y Return: {h.cagr}</span>
                      </div>
                    </div>

                    <a
                      href={h.groww}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] flex items-center gap-1"
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

      {/* ── 3. Fair Value & 5-Pillar Financial Health Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fair Value Intrinsic Valuation Gauge */}
        <div className="lg:col-span-6 ip-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-1)]">
                    InvestingPro Fair Value™ Engine
                  </h3>
                  <p className="text-[11px] text-[var(--text-3)]">
                    Multi-model intrinsic valuation (12 DCF & Multiple models).
                  </p>
                </div>
              </div>

              {/* Ticker Selector */}
              <select
                value={fairValueSymbol}
                onChange={(e) => setFairValueSymbol(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded px-2.5 py-1 text-xs font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="NIFTY_50">NIFTY 50 Index</option>
                <option value="TATA_SMALLCAP">Tata Small Cap Direct</option>
                <option value="UTI_MOMENTUM_30">UTI Momentum 30</option>
              </select>
            </div>

            {fairValueData && (
              <div className="space-y-4">
                {/* Fair Value Hero Tile */}
                <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-mono text-[var(--text-3)] font-semibold">
                      INTRINSIC FAIR VALUE
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-[var(--success)] rounded border border-emerald-500/20">
                      {fairValueData.valuation_status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 my-1">
                    <span className="text-2xl font-black font-mono text-[var(--text-1)]">
                      {fairValueData.fair_value.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--text-3)]">
                      vs Current: <strong className="font-mono text-[var(--text-1)]">{fairValueData.current_price.toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono flex items-center justify-between text-[var(--text-2)]">
                    <span>Upside Potential: <strong className="text-[var(--success)] font-bold">+{fairValueData.upside_potential_pct}%</strong></span>
                    <span>Uncertainty: <strong>{fairValueData.uncertainty}</strong></span>
                  </div>
                </div>

                {/* ProTips Feed */}
                <div>
                  <span className="text-[11px] uppercase font-mono text-[var(--text-3)] block mb-2 font-semibold">
                    ProTips™ Institutional Insights:
                  </span>
                  <div className="space-y-1.5">
                    {fairValueData.protips.map((pt, idx) => (
                      <div key={idx} className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${pt.type === 'bull' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-[var(--text-2)] leading-relaxed">{pt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* 5-Pillar Financial Health Radar */}
        <div className="lg:col-span-6 ip-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-1)]">
                    Financial Health Score (1 to 5)
                  </h3>
                  <p className="text-[11px] text-[var(--text-3)]">
                    Weighted rating across 5 institutional health checks vs peers.
                  </p>
                </div>
              </div>

              {fairValueData && (
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
                  {fairValueData.financial_health_score} / 5.0 • {fairValueData.health_label}
                </span>
              )}
            </div>

            {fairValueData && (
              <div className="space-y-3">
                {Object.entries(fairValueData.health_breakdown).map(([pillar, score]) => (
                  <div key={pillar} className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize font-semibold text-[var(--text-1)]">
                        {pillar.replace('_', ' ')} Health
                      </span>
                      <span className="font-mono font-bold text-[var(--success)]">{score} / 5.0</span>
                    </div>
                    <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                        style={{ width: `${(score / 5.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Valuation Multiples Row */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-3)] block">P/E RATIO</span>
                    <span className="font-bold text-[var(--text-1)]">{fairValueData.pe_ratio}x</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-3)] block">FWD P/E</span>
                    <span className="font-bold text-[var(--text-1)]">{fairValueData.forward_pe}x</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-3)] block">P/B RATIO</span>
                    <span className="font-bold text-[var(--text-1)]">{fairValueData.pb_ratio}x</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-3)] block">DIV YIELD</span>
                    <span className="font-bold text-[var(--text-1)]">{fairValueData.dividend_yield_pct}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 4. Institutional Whale Portfolios (13F & Marquee Superinvestors) ── */}
      <div className="ip-card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <PieChart className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-1)]">
              Institutional Whale & Superinvestor Portfolios (13F / Marquee)
            </h3>
            <p className="text-[11px] text-[var(--text-3)]">
              Track real-world portfolio allocations of legendary global & domestic investors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {whales.map((whale, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-1)]">{whale.investor_name}</h4>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">AUM: {whale.portfolio_value}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                  {whale.top_sector}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {whale.top_picks.map((pick, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-[var(--text-2)] p-1.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                    <span>{pick.name}</span>
                    <span className="font-mono font-bold text-[var(--text-1)]">{pick.weight}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[var(--text-3)] leading-relaxed italic">
                💡 "{whale.core_philosophy}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
