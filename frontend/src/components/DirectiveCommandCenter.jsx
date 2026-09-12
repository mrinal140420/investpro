import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Percent,
  RefreshCw,
  ShieldAlert,
  HelpCircle,
  Check,
  AlertCircle
} from 'lucide-react';

export default function DirectiveCommandCenter() {
  const [directives, setDirectives] = useState([
    {
      id: 'dir-contrarian-01',
      directive_type: 'DEPLOY_DRY_POWDER',
      action: 'BUY',
      source_scheme: 'Parag Parikh Liquid Fund Direct - Growth (Debt/Liquid Bucket)',
      target_scheme: 'Tata Small Cap Fund Direct - Growth (India Equity Bucket)',
      amount_inr: 75000.0,
      units_estimated: 625.5,
      rationale_heading: 'Nifty Smallcap 250 Drawdown at -18.2%: Contrarian Trigger Activated',
      math_rationale:
        'Nifty Smallcap 250 has corrected 18.2% from 52-week high (Breached >= 15% threshold). As per Gajendra Kothari contrarian model, deploying 50% of sideline Liquid Debt dry powder (₹75,000) to capture asymmetric recovery compounding.',
      urgency: 'CRITICAL',
      state: 'PENDING_APPROVAL',
      created_at: '2026-09-12T10:00:00Z',
    },
    {
      id: 'dir-tax-harvest-02',
      directive_type: 'HARVEST_TAX',
      action: 'SELL',
      source_scheme: 'HDFC Nifty 50 Index Fund Direct - Growth',
      target_scheme: 'LIQUID_SETTLEMENT',
      amount_inr: 284000.0,
      units_estimated: 1250.0,
      rationale_heading: 'Section 112A Tax Gain Harvest: ₹1,24,850 tax-free',
      math_rationale:
        'Holding period is 412 days (> 365 days). Realizes ₹1,24,850 LTCG under Budget 2024 annual ₹1.25L exemption. Selling and immediately repurchasing resets purchase NAV from ₹127.30 to ₹227.20, wiping out ₹15,606 in future taxes.',
      urgency: 'HIGH',
      state: 'PENDING_APPROVAL',
      created_at: '2026-09-12T10:00:00Z',
    },
    {
      id: 'dir-rebalance-03',
      directive_type: 'TRIM_AND_SWEEP',
      action: 'SELL',
      source_scheme: 'India Equity Bucket (Current: 56.4%)',
      target_scheme: 'Gold / Sovereign Gold Bonds (Current: 14.1%)',
      amount_inr: 64000.0,
      units_estimated: null,
      rationale_heading: 'Multi-Asset Drift: India Equity Drift +6.4% (> ±5% Limit)',
      math_rationale:
        'Portfolio 50/20/20/10 audit: India Equity has expanded to 56.4% (Target: 50.0%, Drift: +6.4%), while Gold has shrunk to 14.1% (Target: 20.0%, Deficit: -5.9%). Trimming ₹64,000 from Equity and sweeping into Gold to re-anchor risk posture.',
      urgency: 'MEDIUM',
      state: 'PENDING_APPROVAL',
      created_at: '2026-09-12T10:00:00Z',
    },
    {
      id: 'dir-glide-04',
      directive_type: 'SWP_GLIDE_PATH',
      action: 'SWP',
      source_scheme: 'Target Goal Equity Bucket',
      target_scheme: 'Liquid Capital Preservation',
      amount_inr: 72000.0,
      units_estimated: 410.0,
      rationale_heading: 'Goal Horizon at T-24 Months: Automated 4% Monthly SWP Active',
      math_rationale:
        'Home Down Payment goal reaches maturity in 24 months. Systematic 4%/month SWP triggers to convert equity into liquid preservation, eliminating sequence of returns risk.',
      urgency: 'HIGH',
      state: 'PENDING_APPROVAL',
      created_at: '2026-09-12T10:00:00Z',
    },
    {
      id: 'dir-bloat-05',
      directive_type: 'BLOAT_SWITCH',
      action: 'SWITCH',
      source_scheme: 'Nippon India Small Cap Fund Direct (AUM: ₹52,500 Cr)',
      target_scheme: 'UTI Nifty Smallcap 250 Quality 50 Index Fund Direct',
      amount_inr: 10000.0,
      units_estimated: null,
      rationale_heading: 'AUM Bloat Detected (> ₹10,000 Cr Threshold)',
      math_rationale:
        'Small-Cap fund size exceeds liquidity safety threshold of ₹10,000 Crores. Forward monthly SIP is redirected to Smart Beta index to prevent performance degradation and high market impact.',
      urgency: 'HIGH',
      state: 'PENDING_APPROVAL',
      created_at: '2026-09-12T10:00:00Z',
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('PENDING'); // 'PENDING' | 'EXECUTED'
  const [approvingId, setApprovingId] = useState(null);

  // Fetch pending directives from backend if reachable
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/directives/pending')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.directives && data.directives.length > 0) {
          setDirectives(data.directives);
        }
      })
      .catch(() => {
        // In-memory fallback is active
      });
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await fetch('http://127.0.0.1:8000/api/v1/directives/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directive_id: id }),
      });
    } catch {
      // Local optimistic update
    }

    setDirectives((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, state: 'APPROVED', approved_at: new Date().toISOString() }
          : d
      )
    );
    setApprovingId(null);
  };

  const pendingList = directives.filter((d) => d.state === 'PENDING_APPROVAL');
  const approvedList = directives.filter((d) => d.state === 'APPROVED' || d.state === 'EXECUTED');

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-red-500/20 text-red-400 border border-red-500/30">
            CRITICAL TRIGGER
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            SCHEDULED REBALANCE
          </span>
        );
    }
  };

  return (
    <div className="ip-card accent-stripe space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[rgba(226,185,111,0.12)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.3)] flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">Directive Command Center</h3>
              <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded-full bg-[rgba(226,185,111,0.18)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.35)]">
                {pendingList.length} Actionable Signals
              </span>
            </div>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Deterministic, math-backed trade instructions ready for executive sign-off. Zero speculative guesswork.
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] text-xs font-medium shadow-sm">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'PENDING'
                ? 'btn-gold shadow-sm font-bold'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`}
          >
            Pending Approval ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveFilter('EXECUTED')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'EXECUTED'
                ? 'btn-gold shadow-sm font-bold'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`}
          >
            Approved History ({approvedList.length})
          </button>
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-4">
        {activeFilter === 'PENDING' && pendingList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span>All portfolio rules are in equilibrium. No pending trade directives!</span>
          </div>
        )}

        {activeFilter === 'EXECUTED' && approvedList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No directives have been executed yet.
          </div>
        )}

        {(activeFilter === 'PENDING' ? pendingList : approvedList).map((d) => (
          <div
            key={d.id}
            className={`p-5 rounded-xl border transition-all ${
              d.urgency === 'CRITICAL'
                ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                : d.urgency === 'HIGH'
                ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                : 'border-border bg-secondary/30 hover:border-border/80'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getUrgencyBadge(d.urgency)}
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {d.directive_type}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-accent">
                    Action: {d.action}
                  </span>
                </div>

                <h4 className="text-base font-bold text-foreground">
                  {d.rationale_heading}
                </h4>

                {/* Transfer Path */}
                <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium py-1">
                  <span className="px-2 py-0.5 rounded bg-background/80 border border-border truncate max-w-[240px]">
                    {d.source_scheme}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="px-2 py-0.5 rounded bg-background/80 border border-border truncate max-w-[240px]">
                    {d.target_scheme}
                  </span>
                </div>
              </div>

              {/* Amount & Execution Button */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Directive Amount</span>
                  <span className="text-lg font-extrabold text-foreground">
                    ₹{d.amount_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                {d.state === 'PENDING_APPROVAL' ? (
                  <button
                    onClick={() => handleApprove(d.id)}
                    disabled={approvingId === d.id}
                    className="btn-gold px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {approvingId === d.id ? (
                      <RefreshCw className="w-3.5 h-3.5 spin-slow" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    1-Click Approve
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                  </span>
                )}
              </div>
            </div>

            {/* Why This Trade Exists: Math Rationale */}
            <div className="mt-3.5 pt-3 border-t border-border/60 text-xs text-muted-foreground leading-relaxed flex items-start gap-2 bg-background/40 p-3 rounded-lg">
              <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Why This Trade Exists: </strong>
                {d.math_rationale}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
