import React, { useEffect, useState, Component } from 'react';
import Navbar from './components/Navbar';
import InteractiveControlPanel from './components/InteractiveControlPanel';
import WealthProjectionCard from './components/WealthProjectionCard';
import RecommendedPortfolioCard from './components/RecommendedPortfolioCard';
import RiskMonitorsCard from './components/RiskMonitorsCard';
import ExecutionDirectivesFeed from './components/ExecutionDirectivesFeed';
import EmptyState from './components/EmptyState';

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

  // Params — no hardcoded personal defaults
  const [params, setParams] = useState({
    dob:                    '',
    current_ctc_lpa:        0.0,
    monthly_investable_sip: 0.0,
    lump_sum_amount:        0.0,
    annual_step_up_pct:     0.10,
    current_portfolio:      0.0,
    near_target_amount:     0.0,
    near_target_date:       '',
    far_target_amount:      0.0,
    far_target_date:        '',
    assumed_cagr:           0.15,
    savings_rate:           0.30,
    risk_mode:              'aggressive',
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
        }),
        fetch(
          `/api/v1/funds/barbell-universe?monthly_sip=${currentParams.monthly_investable_sip}&lump_sum=${currentParams.lump_sum_amount}&risk_mode=${currentParams.risk_mode}`,
          { method: 'POST' }
        ),
      ]);

      if (trajRes.ok) setTrajectoryData(await trajRes.json());
      if (fundRes.ok) setFundUniverse(await fundRes.json());
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
    if (isFormValid) fetchData(params);
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
        <Navbar theme={theme} setTheme={handleToggleTheme} />

        <main
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '32px', paddingBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Control Panel */}
          <InteractiveControlPanel
            params={params}
            setParams={setParams}
            onRecalculate={handleRecalculate}
            loading={loading}
            validation={validation}
          />

          {/* ── Content area ── */}
          {!isFormValid ? (
            <EmptyState validation={validation} />

          ) : loading && !trajectoryData ? (
            /* Loading skeletons */
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
            /* Results grid */
            <div className="grid grid-cols-12 gap-6">
              <WealthProjectionCard    trajectoryData={trajectoryData} />
              <RecommendedPortfolioCard fundUniverse={fundUniverse} />
              <RiskMonitorsCard         circuitData={null} aumData={null} />
              <ExecutionDirectivesFeed  fundUniverse={fundUniverse} />
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
