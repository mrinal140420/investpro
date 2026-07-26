import React, { useState } from 'react';
import { Send, ExternalLink, Terminal } from 'lucide-react';



function BuyBadge() {
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: '600',
      fontFamily: "'Outfit', sans-serif",
      color: 'var(--success)',
      backgroundColor: 'rgba(22,163,74,0.1)',
      border: '1px solid rgba(22,163,74,0.25)',
      borderRadius: '4px',
      padding: '2px 6px',
      letterSpacing: '0.04em',
      flexShrink: 0,
    }}>
      BUY
    </span>
  );
}

export default function ExecutionDirectivesFeed({ fundUniverse }) {
  const [testing, setTesting]   = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const handleTestTelegram = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/v1/directives/test-telegram', { method: 'POST' });
      if (res.ok) {
        setAlertSent(true);
        setTimeout(() => setAlertSent(false), 4000);
      }
    } catch (e) {
      console.error('Failed to send Telegram test:', e);
    } finally {
      setTesting(false);
    }
  };

  const assets = fundUniverse?.asset_breakdown || [];

  return (
    <div className="col-span-12 lg:col-span-6 ip-card">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Terminal style={{ width: '18px', height: '18px', color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-1)', fontFamily: "'Outfit', sans-serif" }}>
              Execution Directives
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginTop: '1px' }}>
              Directives dispatched to Telegram for manual execution on Groww.
            </p>
          </div>
        </div>
      </div>

      {/* ── Null state ── */}
      {!fundUniverse || assets.length === 0 ? (
        <div style={{ padding: '24px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif" }}>
            Configure your portfolio to see directives.
          </p>
        </div>
      ) : (
        <>
          {/* ── Directive rows ── */}
          <div style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '16px' }}>
            {assets.map((item, idx) => {
              const fundName   = item.fund_name || item.scheme_name || '—';
              const allocSip   = item.allocated_sip || 0;
              const formattedSip = item.formatted_sip || `₹${allocSip.toLocaleString('en-IN')}`;
              const growwUrl   = item.groww_url || 'https://groww.in/mutual-funds';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 14px',
                    borderBottom: idx < assets.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--surface)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                >
                  {/* Left: badge + fund name + SIP */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <BuyBadge />
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-1)',
                        fontFamily: "'Outfit', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {fundName}
                      </p>
                      <p style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-3)', marginTop: '1px' }}>
                        Monthly SIP · {formattedSip}
                      </p>
                    </div>
                  </div>

                  {/* Right: Groww link */}
                  <a
                    href={growwUrl}
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
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Groww <ExternalLink style={{ width: '11px', height: '11px' }} />
                  </a>
                </div>
              );
            })}
          </div>

          {/* ── Circuit breaker note ── */}
          <p style={{
            fontSize: '12px',
            color: 'var(--text-3)',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: '1.5',
            marginBottom: '16px',
          }}>
            PAUSE SIP directives appear here when the circuit breaker triggers a momentum breakdown.
          </p>
        </>
      )}

      {/* ── Telegram test (debug utility) ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <button
          onClick={handleTestTelegram}
          disabled={testing}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: testing ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: 'var(--text-3)',
            fontFamily: "'Outfit', sans-serif",
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            opacity: testing ? 0.5 : 1,
          }}
        >
          <Send style={{ width: '11px', height: '11px' }} />
          {testing ? 'Sending...' : alertSent ? 'Alert sent!' : 'Test Telegram alert'}
        </button>
      </div>

    </div>
  );
}
