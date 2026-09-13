import React, { useEffect, useState, Component } from 'react';
import Navbar from './components/Navbar';
import InteractiveControlPanel from './components/InteractiveControlPanel';
import WealthProjectionCard from './components/WealthProjectionCard';
import RecommendedPortfolioCard from './components/RecommendedPortfolioCard';
import RiskMonitorsCard from './components/RiskMonitorsCard';
import ExecutionDirectivesFeed from './components/ExecutionDirectivesFeed';
import GoalSlicingCard from './components/GoalSlicingCard';
import TaxAndMilestonesCard from './components/TaxAndMilestonesCard';
import HinglishAdvisorChat from './components/HinglishAdvisorChat';
import EmptyState from './components/EmptyState';
import BehavioralShield from './components/BehavioralShield';
import DirectiveCommandCenter from './components/DirectiveCommandCenter';
import CasUploadModal from './components/CasUploadModal';
import { Compass, PiggyBank, ShieldCheck, Award, TrendingUp, Sparkles, Zap, Lock } from 'lucide-react';
import { getEnrichedFundUniverse } from './utils/financialCalculations';

// ── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'var(--bg)',
          fontFamily: "'Outfit', sans-serif",
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--danger)', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', maxWidth: '420px', lineHeight: '1.6', marginBottom: '24px' }}>
            A render error occurred while processing the dashboard. Reload to try again.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Skeleton loading blocks ─────────────────────────────────────────────────
function Skeleton({ height }) {
  return (
    <div
      className="skeleton"
      style={{
        height,
      }}
    />
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('barbell'); // 'barbell' | 'behavioral_shield' | 'directive_center' | 'reverse_emi' | 'tax_milestones'
  const [isCasModalOpen, setIsCasModalOpen] = useState(false);

  // Read initial theme from localStorage (set by index.html init script)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync theme on mount to ensure consistency
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Single consolidated theme toggle handler
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
    if (next === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Params — clean Indian mutual fund defaults
  const [params, setParams] = useState({
    dob:                    '2005-04-14',
    current_ctc_lpa:        12.0,
    monthly_investable_sip: 25000.0,
    lump_sum_amount:        50000.0,
    annual_step_up_pct:     0.10,
    current_portfolio:      0.0,
    near_target_amount:     5000000.0,
    near_target_date:       '2028-12-31',
    far_target_amount:      30000000.0,
    far_target_date:        '2035-04-14',
    assumed_cagr:           0.15,
    savings_rate:           0.30,
    risk_mode:              'global_multi_asset',
  });

  const [trajectoryData, setTrajectoryData] = useState(null);
  const [fundUniverse,   setFundUniverse]   = useState(null);
  const [loading,        setLoading]        = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────
  const hasInvestment    = (params.monthly_investable_sip > 0) || (params.lump_sum_amount > 0);
  const hasTargetCorpus  = params.near_target_amount > 0;
  const hasTargetHorizon = Boolean(params.near_target_date && params.near_target_date !== '');
  const hasCurrentCTC    = params.current_ctc_lpa > 0;
  const isFormValid      = hasInvestment && hasTargetCorpus && hasTargetHorizon && hasCurrentCTC;

  const validation = { hasInvestment, hasTargetCorpus, hasTargetHorizon, hasCurrentCTC, isFormValid };

  // ── Data fetching ───────────────────────────────────────────────────────
  const fetchData = async (currentParams) => {
    if (!isFormValid) {
      setTrajectoryData(null);
      setFundUniverse(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [trajRes, fundRes] = await Promise.all([
        fetch('/api/v1/user/trajectory-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentParams),
        }).catch(() => null),
        fetch(
          `/api/v1/funds/barbell-universe?monthly_sip=${currentParams.monthly_investable_sip}&lump_sum=${currentParams.lump_sum_amount}&risk_mode=${currentParams.risk_mode}`,
          { method: 'POST' }
        ).catch(() => null),
      ]);

      if (trajRes && trajRes.ok) {
        setTrajectoryData(await trajRes.json());
      } else {
        // High-precision Client-side Mathematical Fallback
        const sip = currentParams.monthly_investable_sip || 25000;
        const lump = currentParams.lump_sum_amount || 0;
        const ctc = currentParams.current_ctc_lpa || 12;
        const stepUp = currentParams.annual_step_up_pct ?? 0.10;
        const target = currentParams.near_target_amount || 5000000;
        const targetDate = new Date(currentParams.near_target_date || '2028-12-31');
        const today = new Date();
        const months = Math.max(1, Math.round((targetDate - today) / (1000 * 60 * 60 * 24 * 30.4375)));
        const r_m = Math.pow(1 + 0.15, 1 / 12) - 1;

        let corpus = lump;
        let curSip = sip;
        let totalContrib = lump;
        for (let m = 1; m <= months; m++) {
          if (m > 1 && (m % 12 === 1)) curSip *= (1 + stepUp);
          corpus = (corpus + curSip) * (1 + r_m);
          totalContrib += curSip;
        }

        const capitalGains = Math.max(0, corpus - totalContrib);
        const taxableGains = Math.max(0, capitalGains - 125000);
        const ltcgTax = taxableGains * 0.125;
        const postTax = corpus - ltcgTax;
        const yearsRem = Math.round((months / 12) * 10) / 10;
        const realPower = postTax / Math.pow(1.06, yearsRem);

        // Career Roadmap Generation
        const roadmap = [];
        let rCorpus = lump;
        let rSip = sip;
        const startYr = new Date().getFullYear();
        for (let yr = 0; yr <= 9; yr++) {
          for (let m = 1; m <= 12; m++) {
            rCorpus = (rCorpus + rSip) * (1 + r_m);
          }
          roadmap.push({
            year: startYr + yr,
            role: yr === 0 ? 'Senior Software Engineer' : yr <= 2 ? 'Lead Architect / Staff' : yr <= 5 ? 'Principal / VP Wealth Milestone' : 'Director / Executive',
            suggested_ctc_lpa: Math.round(ctc * Math.pow(1.12, yr) * 10) / 10,
            formatted_ctc: `₹${(Math.round(ctc * Math.pow(1.12, yr) * 10) / 10).toFixed(1)} LPA`,
            monthly_sip: Math.round(rSip),
            formatted_sip: `₹${Math.round(rSip).toLocaleString('en-IN')}`,
            projected_corpus_eoy: Math.round(rCorpus),
            formatted_corpus: rCorpus >= 10000000 ? `₹${(rCorpus / 10000000).toFixed(2)} Cr` : `₹${(rCorpus / 100000).toFixed(2)} Lakhs`,
          });
          rSip *= (1 + stepUp);
        }

        setTrajectoryData({
          user_profile: {
            monthly_sip: sip,
            lump_sum: lump,
            target_amount: target,
            target_date: currentParams.near_target_date,
            annual_step_up_pct: stepUp,
          },
          short_term_target: {
            months_remaining: months,
            years_remaining: yearsRem,
            total_contributions: totalContrib,
            formatted_contributions: totalContrib >= 10000000 ? `₹${(totalContrib / 10000000).toFixed(2)} Cr` : `₹${(totalContrib / 100000).toFixed(2)} Lakhs`,
            target_amount: target,
            formatted_target: target >= 10000000 ? `₹${(target / 10000000).toFixed(2)} Cr` : `₹${(target / 100000).toFixed(2)} Lakhs`,
            projected_short_fv: corpus,
            formatted_projected: corpus >= 10000000 ? `₹${(corpus / 10000000).toFixed(2)} Cr` : `₹${(corpus / 100000).toFixed(2)} Lakhs`,
            ltcg_tax: ltcgTax,
            formatted_tax: `₹${Math.round(ltcgTax).toLocaleString('en-IN')}`,
            post_tax_corpus: postTax,
            formatted_post_tax: postTax >= 10000000 ? `₹${(postTax / 10000000).toFixed(2)} Cr` : `₹${(postTax / 100000).toFixed(2)} Lakhs`,
            real_purchasing_power_today: realPower,
            formatted_real_power: realPower >= 10000000 ? `₹${(realPower / 10000000).toFixed(2)} Cr` : `₹${(realPower / 100000).toFixed(2)} Lakhs`,
            verdict: corpus >= target ? 'ON_TRACK' : (months < 36 && target >= 5000000 && corpus < target * 0.4 ? 'UNREALISTIC_TIMELINE' : 'NEEDS_ADJUSTMENT'),
            safe_alternative_years: Math.round(Math.max(yearsRem, Math.log(target / (lump || sip * 12)) / Math.log(1.14))),
            formatted_needed_sip: `₹${Math.round(target / months).toLocaleString('en-IN')}`,
            formatted_needed_ctc: `₹${Math.round(((target / months) / 0.3 / 0.85) * 12 / 100000)} LPA`,
            message: corpus >= target
              ? `ON TRACK! At ₹${sip.toLocaleString('en-IN')}/mo SIP (+ ${Math.round(stepUp * 100)}% annual step-up), you will comfortably achieve ₹${(target / 100000).toFixed(1)} Lakhs by ${targetDate.getFullYear()}!`
              : `REALITY CHECK ALERT: Reaching ₹${(target / 100000).toFixed(1)} Lakhs in only ${months} months is mathematically impossible without speculative gambling. Your current plan safely accumulates ₹${(corpus / 100000).toFixed(2)} Lakhs.`,
          },
          career_roadmap_to_3cr: roadmap,
        });
      }

      if (fundRes && fundRes.ok) {
        setFundUniverse(await fundRes.json());
      } else {
        // High-precision Client-side Mathematical Research Fallback
        setFundUniverse(getEnrichedFundUniverse(
          currentParams.monthly_investable_sip,
          currentParams.lump_sum_amount,
          currentParams.risk_mode
        ));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced reactive fetch on param changes
  useEffect(() => {
    if (!isFormValid) {
      setTrajectoryData(null);
      setFundUniverse(null);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => fetchData(params), 250);
    return () => clearTimeout(timer);
  }, [params]);

  const handleRecalculate = () => {
    if (isFormValid) {
      fetchData(params);
      setTimeout(() => {
        const el = document.getElementById('results-grid');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-1)',
        fontFamily: "'Outfit', sans-serif",
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}>
        <Navbar
          theme={theme}
          setTheme={handleToggleTheme}
          onOpenCasModal={() => setIsCasModalOpen(true)}
        />

        <main
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '24px', paddingBottom: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Beginner to Pro Mutual Fund Strategy Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--surface)] via-[var(--surface-2)] to-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[var(--accent-glow)] to-transparent pointer-events-none opacity-40" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface)] border border-[var(--accent-border)] flex items-center justify-center p-1 shadow-md">
                <img
                  src="/LOGO.png"
                  alt="InvestPro Bull Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(226,185,111,0.4)]"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">
                    InvestPro Digital Family Office Command Center
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[rgba(226,185,111,0.15)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.3)]">
                    100% Direct Mutual Funds
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-[var(--success)] border border-emerald-500/25">
                    Zero Paid APIs
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] mt-0.5 max-w-2xl leading-relaxed">
                  Deterministic wealth compounding: 10% Step-Up SIPs, 50/30/10/10 Factor Barbell, Asymmetric Drawdown Deployment, and Section 112A Tax Harvesting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-3)] tracking-wider">Execution Hub</span>
                <span className="text-xs font-mono font-bold text-[var(--accent-bright)]">Direct Growth Mode</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--accent-border)] text-xs font-mono font-bold text-[var(--gold)] shadow-sm">
                Groww Direct
              </span>
            </div>
          </div>

          {/* Navigation Subsystem Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] w-fit shadow-md">
            <button
              onClick={() => setActiveTab('barbell')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'barbell'
                  ? 'btn-gold shadow-md'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>1. Long-Term Wealth & Barbell</span>
            </button>

            <button
              onClick={() => setActiveTab('behavioral_shield')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'behavioral_shield'
                  ? 'btn-gold shadow-md'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2. Behavioral Shield (Locked Goals)</span>
            </button>

            <button
              onClick={() => setActiveTab('directive_center')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'directive_center'
                  ? 'btn-gold shadow-md'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>3. Directive Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('reverse_emi')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reverse_emi'
                  ? 'btn-gold shadow-md'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>4. Emergency Shield & Goals</span>
            </button>

            <button
              onClick={() => setActiveTab('tax_milestones')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tax_milestones'
                  ? 'btn-gold shadow-md'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>5. Tax Savings & Milestones</span>
            </button>
          </div>

          {/* Tab 1: Long-Term Barbell & Step-Up Trajectory */}
          {activeTab === 'barbell' && (
            <>
              {/* Interactive Control Panel */}
              <InteractiveControlPanel
                params={params}
                setParams={setParams}
                onRecalculate={handleRecalculate}
                loading={loading}
                validation={validation}
              />

              {/* Content area */}
              {!isFormValid ? (
                <EmptyState validation={validation} />
              ) : loading && !trajectoryData ? (
                <div 
                  style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                  role="status"
                  aria-live="polite"
                  aria-label="Loading dashboard data"
                >
                  <Skeleton height="420px" />
                  <Skeleton height="360px" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <Skeleton height="280px" />
                    <Skeleton height="280px" />
                  </div>
                </div>
              ) : (
                <div id="results-grid" className="grid grid-cols-12 gap-6 scroll-mt-6">
                  <WealthProjectionCard trajectoryData={trajectoryData} />
                  <RecommendedPortfolioCard 
                    fundUniverse={fundUniverse} 
                    monthlySip={params.monthly_investable_sip}
                    lumpSum={params.lump_sum_amount}
                    riskMode={params.risk_mode}
                  />
                  <RiskMonitorsCard circuitData={null} aumData={null} />
                  <ExecutionDirectivesFeed fundUniverse={fundUniverse} />
                </div>
              )}
            </>
          )}

          {/* Tab 2: Behavioral Shield & Locked Goals */}
          {activeTab === 'behavioral_shield' && (
            <BehavioralShield userParams={params} />
          )}

          {/* Tab 3: Directive Command Center (Approval Queue) */}
          {activeTab === 'directive_center' && (
            <DirectiveCommandCenter userParams={params} />
          )}

          {/* Tab 4: Emergency Shield & Lifestyle Goal Slicer */}
          {activeTab === 'reverse_emi' && (
            <GoalSlicingCard userParams={params} />
          )}

          {/* Tab 5: Section 112A Tax Savings & 1% Freedom Index */}
          {activeTab === 'tax_milestones' && (
            <TaxAndMilestonesCard 
              currentPortfolio={params.current_portfolio + params.lump_sum_amount}
              currentCtcLpa={params.current_ctc_lpa}
            />
          )}

          {/* CAS PDF Ingestion Modal */}
          <CasUploadModal
            isOpen={isCasModalOpen}
            onClose={() => setIsCasModalOpen(false)}
            onIngestionComplete={(data) => {
              console.log('CAS Statement Imported Successfully:', data);
            }}
          />

          {/* Hinglish AI Financial Advisor Chatbot */}
          <HinglishAdvisorChat params={params} fundUniverse={fundUniverse} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
