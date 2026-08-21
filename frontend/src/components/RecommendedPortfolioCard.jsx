import React from 'react';
import { ExternalLink, PieChart } from 'lucide-react';



const sectionHeading = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '12px',
};

const STRATEGY_LABELS = {
  global_multi_asset: '🌐 Global Multi-Asset (INDmoney Style)',
  aggressive:         '🌐 Global Multi-Asset Barbell',
  ultra_aggressive:   '🚀 High-Alpha Tech & Small Cap',
  balanced:           '🛡️ All-Weather Balanced',
};

function getRiskStyle(risk = '') {
  const r = risk.toLowerCase();
  if (r === 'very high' || r === 'high') {
    return {
      color: 'var(--danger)',
      backgroundColor: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.2)',
    };
  }
  if (r === 'moderate-high' || r === 'moderate') {
    return {
      color: 'var(--warning)',
      backgroundColor: 'rgba(217,119,6,0.08)',
      border: '1px solid rgba(217,119,6,0.2)',
    };
  }
  return {
    color: 'var(--success)',
    backgroundColor: 'rgba(22,163,74,0.08)',
    border: '1px solid rgba(22,163,74,0.2)',
  };
}

export default function RecommendedPortfolioCard({ fundUniverse }) {
  if (!fundUniverse) return null;

  const hasInvestment =
    (fundUniverse.total_monthly_sip && fundUniverse.total_monthly_sip > 0) ||
    (fundUniverse.total_lump_sum && fundUniverse.total_lump_sum > 0);

  if (!hasInvestment) return null;

  const assets          = fundUniverse.asset_breakdown || fundUniverse.funds || [];
  const weightedCagr    = fundUniverse.portfolio_weighted_5y_cagr || 0;
  const totalGrowth     = fundUniverse.formatted_total_annual_growth || '—';
  const strategyLabel   = STRATEGY_LABELS[fundUniverse.risk_mode] || (fundUniverse.risk_mode || 'Aggressive');

  return (
    <div className="col-span-12 ip-card">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <PieChart style={{ width: '18px', height: '18px', color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', fontFamily: "'Outfit', sans-serif" }}>
              Recommended Portfolio
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
              Fund allocation, historical returns, and projected annual wealth addition.
            </p>
          </div>
        </div>

        {/* Strategy pill */}
        <span style={{
          fontSize: '12px',
          fontFamily: "'Outfit', sans-serif",
          color: 'var(--text-2)',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '4px 12px',
          fontWeight: '500',
        }}>
          {strategyLabel}
        </span>
      </div>

      {/* ── Fund Table ── */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Outfit', sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Fund', 'Risk', '3Y / 5Y / All', 'Annual addition', 'Role', 'Execute'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'Outfit', sans-serif",
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((item, idx) => {
              const returns    = item.returns || { cagr_3y: 0, cagr_5y: 0, cagr_all_time: 0 };
              const riskStyle  = getRiskStyle(item.risk_level || 'High');
              const fundName   = item.fund_name || item.scheme_name || '—';
              const bucket     = item.bucket || '';

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Fund name + bucket */}
                  <td style={{ padding: '12px 14px', maxWidth: '220px' }}>
                    <p style={{ fontWeight: '500', color: 'var(--text-1)', fontSize: '13px', marginBottom: '2px' }}>
                      {fundName}
                    </p>
                    {bucket && (
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--text-3)',
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        {bucket}
                      </span>
                    )}
                  </td>

                  {/* Risk badge */}
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      ...riskStyle,
                      fontSize: '11px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      padding: '3px 8px',
                      fontFamily: "'Outfit', sans-serif",
                      whiteSpace: 'nowrap',
                    }}>
                      {item.risk_level || 'High'}
                    </span>
                  </td>

                  {/* Returns */}
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {[
                        { label: '3Y', value: returns.cagr_3y },
                        { label: '5Y', value: returns.cagr_5y },
                        { label: 'All', value: returns.cagr_all_time },
                      ].map(r => (
                        <div key={r.label} style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginBottom: '1px' }}>
                            {r.label}
                          </p>
                          <p style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600', color: 'var(--text-1)' }}>
                            {r.value}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Annual wealth addition */}
                  <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600', color: 'var(--success)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {item.formatted_growth_contribution || '—'}
                  </td>

                  {/* Role in goal */}
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: '13px', maxWidth: '180px' }}>
                    {item.goal_impact_role || '—'}
                  </td>

                  {/* Groww link */}
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    {item.groww_url ? (
                      <a
                        href={item.groww_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: '500',
                          color: 'var(--accent)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Groww <ExternalLink style={{ width: '11px', height: '11px' }} />
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Summary row ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Portfolio weighted 5Y CAGR
          </p>
          <p style={{ fontSize: '18px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--success)' }}>
            {weightedCagr}%
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Total annual wealth addition
          </p>
          <p style={{ fontSize: '18px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--accent)' }}>
            {totalGrowth}
          </p>
        </div>
      </div>

    </div>
  );
}
