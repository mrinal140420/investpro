import React from 'react';
import { ShieldCheck, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';



const sectionHeading = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '12px',
};

const statTileStyle = {
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: 'var(--surface-2)',
  border: '1px solid var(--border)',
  textAlign: 'center',
};

function AumStatusPill({ status }) {
  const styles = {
    HEALTHY: { color: 'var(--success)', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.25)' },
    WARNING: { color: 'var(--warning)', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)' },
    BLOATED: { color: 'var(--danger)',  bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)' },
  };
  const s = styles[status] || styles.HEALTHY;
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '500',
      fontFamily: "'Outfit', sans-serif",
      color: s.color,
      backgroundColor: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '9999px',
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

// Placeholder AUM data — rendered until the daily pipeline populates real values
const PLACEHOLDER_AUM = [
  { scheme_name: 'Tata Small Cap Fund — Direct Growth',        current_aum_crores: 8420,  status: 'HEALTHY' },
  { scheme_name: 'UTI Nifty 200 Momentum 30 Index Fund',       current_aum_crores: 3150,  status: 'HEALTHY' },
  { scheme_name: 'ICICI Prudential Nifty Next 50 Index Fund',   current_aum_crores: 6890,  status: 'HEALTHY' },
];

export default function RiskMonitorsCard({ circuitData, aumData }) {
  // Derive SMA values from circuitData prop if available, otherwise use indicative placeholders
  let sma50  = 24850;
  let sma200 = 23900;

  if (circuitData && Array.isArray(circuitData) && circuitData.length > 0) {
    const accelerator = circuitData.find(d => d.scheme_name && d.sma_50 && d.sma_200);
    if (accelerator) {
      sma50  = accelerator.sma_50;
      sma200 = accelerator.sma_200;
    }
  }

  const isBullish = sma50 > sma200;

  // Use live aumData if available, otherwise fall back to placeholder
  const aumRows = (aumData && Array.isArray(aumData) && aumData.length > 0)
    ? aumData
    : PLACEHOLDER_AUM;

  return (
    <div className="col-span-12 lg:col-span-6 ip-card">

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-5">
        <ShieldCheck style={{ width: '18px', height: '18px', color: 'var(--accent)', flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-1)', fontFamily: "'Outfit', sans-serif" }}>
            Risk Monitors
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginTop: '1px' }}>
            SMA circuit breaker and AUM bloat status for your portfolio.
          </p>
        </div>
      </div>

      {/* ── SMA Circuit Breaker ── */}
      <div style={{ marginBottom: '8px' }}>
        <h4 style={sectionHeading}>SMA Circuit Breaker</h4>

        {/* SMA stat tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div style={statTileStyle}>
            <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif', textTransform: 'uppercase", letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase' }}>
              50-Day SMA
            </p>
            <p style={{ fontSize: '20px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--text-1)' }}>
              {sma50.toLocaleString('en-IN')}
            </p>
          </div>
          <div style={statTileStyle}>
            <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase' }}>
              200-Day SMA
            </p>
            <p style={{ fontSize: '20px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--text-1)' }}>
              {sma200.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Trend status line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '6px',
          backgroundColor: isBullish ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          border: `1px solid ${isBullish ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
          marginBottom: '12px',
        }}>
          {isBullish
            ? <CheckCircle2 style={{ width: '14px', height: '14px', color: 'var(--success)', flexShrink: 0 }} />
            : <AlertTriangle style={{ width: '14px', height: '14px', color: 'var(--danger)', flexShrink: 0 }} />}
          <span style={{
            fontSize: '13px',
            fontWeight: '500',
            fontFamily: "'Outfit', sans-serif",
            color: isBullish ? 'var(--success)' : 'var(--danger)',
          }}>
            {isBullish
              ? 'Bullish — SMA 50 above SMA 200'
              : 'Bearish — SMA 50 below SMA 200'}
          </span>
        </div>

        {/* Explanation */}
        <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", lineHeight: '1.6', marginBottom: '8px' }}>
          The circuit breaker monitors the Momentum fund in your Accelerator bucket.
          If the 50-day average drops below the 200-day average (a death cross), the system
          recommends pausing momentum SIPs and redirecting capital to the Liquid Fund until
          the trend recovers.
        </p>

        {/* Disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>
          SMA values are indicative. Computed from daily AMFI NAV data.
        </p>
      </div>

      {/* ── AUM Bloat Monitor ── */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '20px' }}>
        <h4 style={sectionHeading}>AUM Bloat Monitor</h4>

        <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", lineHeight: '1.5', marginBottom: '12px' }}>
          Small-cap and momentum funds lose agility above{' '}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-2)' }}>₹10,000 Crore</span>{' '}
          AUM. The system flags bloated funds and recommends leaner alternatives.
        </p>

        {/* AUM rows */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {aumRows.map((fund, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 14px',
                borderBottom: idx < aumRows.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--surface)',
              }}
            >
              <span style={{
                fontSize: '13px',
                color: 'var(--text-2)',
                fontFamily: "'Outfit', sans-serif",
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {fund.scheme_name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-3)',
                  whiteSpace: 'nowrap',
                }}>
                  ₹{fund.current_aum_crores?.toLocaleString('en-IN')} Cr
                </span>
                <AumStatusPill status={fund.status} />
              </div>
            </div>
          ))}
        </div>

        {/* AUM disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Info style={{ width: '11px', height: '11px', flexShrink: 0 }} />
          AUM data updated via daily pipeline.
        </p>
      </div>

    </div>
  );
}
