import React from 'react';
import { BarChart2, CheckCircle2, Circle } from 'lucide-react';

const FIELDS = [
  { key: 'hasInvestment',    label: 'Monthly SIP or lump sum' },
  { key: 'hasTargetCorpus',  label: 'Target corpus (₹)' },
  { key: 'hasTargetHorizon', label: 'Investment time horizon' },
  { key: 'hasCurrentCTC',    label: 'Annual CTC (LPA)' },
];

export default function EmptyState({ validation = {} }) {
  const { hasInvestment, hasTargetCorpus, hasTargetHorizon, hasCurrentCTC } = validation;
  const stateMap = { hasInvestment, hasTargetCorpus, hasTargetHorizon, hasCurrentCTC };
  const filledCount = Object.values(stateMap).filter(Boolean).length;

  return (
    <div className="ip-card" style={{
      minHeight: '340px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '48px 32px',
      background: 'linear-gradient(160deg, var(--surface) 0%, var(--bg-elevated) 100%)',
    }}>
      {/* Icon */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: 'var(--accent-glow)', border: '1px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: '0 4px 20px var(--accent-glow)',
      }}>
        <BarChart2 style={{ width: '24px', height: '24px', color: 'var(--accent-bright)' }} />
      </div>

      <h3 style={{
        fontFamily: "'Outfit', sans-serif", fontSize: '18px',
        fontWeight: '700', color: 'var(--text-1)',
        letterSpacing: '-0.02em', marginBottom: '10px',
      }}>
        Complete your profile to see projections
      </h3>

      <p style={{
        fontFamily: "'Outfit', sans-serif", fontSize: '13px',
        color: 'var(--text-2)', maxWidth: '460px',
        lineHeight: '1.65', marginBottom: '28px',
      }}>
        InvestPro calculates whether your current SIP and salary trajectory can hit your
        corpus target by your deadline — and tells you exactly what needs to change if not.
      </p>

      {/* Progress indicator */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '20px' }} role="progressbar" aria-valuenow={filledCount} aria-valuemin="0" aria-valuemax="4" aria-label={`Profile completion: ${filledCount} of 4 fields completed`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Setup progress
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-bright)', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600' }}>
            {filledCount}/4
          </span>
        </div>
        <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: 'var(--surface-3)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '9999px',
            width: `${(filledCount / 4) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 8px var(--accent-glow)',
          }} />
        </div>
      </div>

      {/* Checklist */}
      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '4px 0',
        width: '100%', maxWidth: '380px',
        textAlign: 'left',
        boxShadow: 'var(--shadow-card)',
      }}>
        {FIELDS.map((field, idx) => {
          const filled = stateMap[field.key];
          return (
            <div key={field.key} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 16px',
              borderBottom: idx < FIELDS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.1s',
            }}>
              {filled
                ? <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--success)', flexShrink: 0 }} />
                : <Circle style={{ width: '16px', height: '16px', color: 'var(--text-3)', flexShrink: 0 }} />
              }
              <span style={{
                fontSize: '13px', fontFamily: "'Outfit', sans-serif",
                color: filled ? 'var(--text-2)' : 'var(--text-1)',
                fontWeight: filled ? '400' : '500',
              }}>
                {field.label}
              </span>
              {filled && (
                <span style={{
                  marginLeft: 'auto', fontSize: '10px', fontWeight: '600',
                  color: 'var(--success)', fontFamily: "'Outfit', sans-serif",
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
