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
import { apiFetchTrajectory, apiFetchFundUniverse, calculateTrajectoryAnalysis } from './utils/apiClient';

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
      const [trajData, fundData] = await Promise.all([
        apiFetchTrajectory(currentParams),
        apiFetchFundUniverse(
          currentParams.monthly_investable_sip,
          currentParams.lump_sum_amount,
          currentParams.risk_mode
        ),
      ]);

      setTrajectoryData(trajData);
      setFundUniverse(fundData);
    } catch (err) {
      console.warn('API error caught, computing locally:', err);
      setTrajectoryData(calculateTrajectoryAnalysis(currentParams));
      setFundUniverse(getEnrichedFundUniverse(
        currentParams.monthly_investable_sip,
        currentParams.lump_sum_amount,
        currentParams.risk_mode
      ));
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
