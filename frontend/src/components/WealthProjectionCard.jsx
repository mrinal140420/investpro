import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Briefcase, Info } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { format_indian_currency, get_real_world_equivalent_note } from '../utils/formatters';



const sectionHeading = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '12px',
};

const monoVal = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '22px',
  fontWeight: '700',
  color: 'var(--text-1)',
};

// Custom tooltip for the area chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: "'Outfit', sans-serif",
      fontSize: '12px',
      color: 'var(--text-2)',
    }}>
      <p style={{ fontWeight: '600', color: 'var(--text-1)', marginBottom: '4px' }}>
        {label}
      </p>
      <p>Corpus: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)' }}>{d.corpusFormatted}</span></p>
      <p>SIP: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.sipFormatted}</span></p>
      {d.role && <p style={{ marginTop: '4px', color: 'var(--text-3)' }}>{d.role}</p>}
    </div>
  );
}

export default function WealthProjectionCard({ trajectoryData }) {
  const [inflationRate, setInflationRate] = useState(6.0);
  const [taxRate, setTaxRate] = useState(12.5);

  if (!trajectoryData || !trajectoryData.short_term_target) {
    return (
      <div className="col-span-12 ip-card" style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            margin: '0 auto 12px',
            animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
          }} />
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif" }}>
            Computing wealth projection...
          </p>
        </div>
      </div>
    );
  }

  const shortTerm = trajectoryData.short_term_target || {};
  const careerRoadmap = trajectoryData.career_roadmap_to_3cr || [];
  const isOnTrack = shortTerm.verdict === 'ON_TRACK';

  const chartData = careerRoadmap.map(item => ({
    year: item.year,
    corpusRaw: item.projected_corpus_eoy || 0,
    corpusFormatted: item.formatted_corpus || '',
    sipFormatted: item.formatted_sip || '',
    role: item.role || '',
  }));

  const maxCorpus = chartData.length > 0 ? Math.max(...chartData.map(d => d.corpusRaw)) : 10000000;
  const startYear = chartData.length > 0 ? chartData[0].year : new Date().getFullYear();
  const endYear   = chartData.length > 0 ? chartData[chartData.length - 1].year : startYear + 9;

  const grossRaw        = shortTerm.projected_short_fv || 1;
  const contributionsRaw = shortTerm.total_contributions || 0;
  const yearsRemaining  = shortTerm.years_remaining || 2.5;

  const capitalGains    = Math.max(0, grossRaw - contributionsRaw);
  const taxableGains    = Math.max(0, capitalGains - 125000);
  const calculatedTax   = taxableGains * (taxRate / 100);
  const postTaxCorpus   = grossRaw - calculatedTax;
  const inflationFactor = (1 + inflationRate / 100) ** yearsRemaining;
  const realPower       = postTaxCorpus / inflationFactor;

  const taxPct          = Math.min(100, Math.max(0, (calculatedTax / grossRaw) * 100));
  const inflationLossRaw = postTaxCorpus - realPower;
  const inflationLossPct = Math.min(100, Math.max(0, (inflationLossRaw / grossRaw) * 100));
  const realPowerPct    = Math.max(0, 100 - taxPct - inflationLossPct);

  const dynamicNote = get_real_world_equivalent_note(realPower, endYear, postTaxCorpus);

  const yAxisFormatter = v => {
    if (maxCorpus >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    if (maxCorpus >= 100000)   return `${(v / 100000).toFixed(0)}L`;
    return `₹${v.toLocaleString()}`;
  };

  return (
    <div className="col-span-12 ip-card">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <TrendingUp style={{ width: '18px', height: '18px', color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-1)', fontFamily: "'Outfit', sans-serif" }}>
              Wealth Projection
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
              Target {shortTerm.formatted_target || '—'} by {endYear} · {shortTerm.years_remaining ? `${shortTerm.years_remaining} years remaining` : ''}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '500',
          fontFamily: "'Outfit', sans-serif",
          backgroundColor: isOnTrack 
            ? 'rgba(22,163,74,0.1)' 
            : shortTerm.verdict === 'UNREALISTIC_TIMELINE' 
            ? 'rgba(220,38,38,0.1)' 
            : 'rgba(217,119,6,0.1)',
          border: `1px solid ${
            isOnTrack 
              ? 'rgba(22,163,74,0.3)' 
              : shortTerm.verdict === 'UNREALISTIC_TIMELINE' 
              ? 'rgba(220,38,38,0.3)' 
              : 'rgba(217,119,6,0.3)'
          }`,
          color: isOnTrack ? 'var(--success)' : shortTerm.verdict === 'UNREALISTIC_TIMELINE' ? 'var(--danger)' : 'var(--warning)',
        }}>
          {isOnTrack
            ? <CheckCircle2 style={{ width: '13px', height: '13px' }} />
            : <AlertTriangle style={{ width: '13px', height: '13px' }} />}
          {isOnTrack ? 'On Track' : shortTerm.verdict === 'UNREALISTIC_TIMELINE' ? 'Reality Check Required' : 'Needs Adjustment'}
        </span>
      </div>

      {/* ── Status banner ── */}
      <div style={{
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        backgroundColor: isOnTrack 
          ? 'rgba(22,163,74,0.08)' 
          : shortTerm.verdict === 'UNREALISTIC_TIMELINE' 
          ? 'rgba(220,38,38,0.08)' 
          : 'rgba(217,119,6,0.08)',
        border: `1px solid ${
          isOnTrack 
            ? 'rgba(22,163,74,0.25)' 
            : shortTerm.verdict === 'UNREALISTIC_TIMELINE' 
            ? 'rgba(220,38,38,0.3)' 
            : 'rgba(217,119,6,0.25)'
        }`,
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: "'Outfit', sans-serif", lineHeight: '1.6', margin: 0 }}>
          {shortTerm.message}
        </p>

        {/* Reality Check Alert with Structured Comparison Tiles */}
        {shortTerm.verdict === 'UNREALISTIC_TIMELINE' && (
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(220,38,38,0.2)',
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] uppercase font-mono text-[var(--text-3)] block font-semibold">
                  1. Current Plan in {shortTerm.years_remaining} Yrs
                </span>
                <span className="text-base font-bold font-mono text-[var(--text-1)] block mt-0.5">
                  {shortTerm.formatted_projected}
                </span>
                <span className="text-[11px] text-[var(--text-3)] block mt-0.5">
                  Realistic safe accumulation
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] uppercase font-mono text-[var(--success)] block font-semibold">
                  2. Safe Horizon for {shortTerm.formatted_target}
                </span>
                <span className="text-base font-black font-mono text-[var(--success)] block mt-0.5">
                  ~{shortTerm.safe_alternative_years || 15} Years
                </span>
                <span className="text-[11px] text-[var(--text-3)] block mt-0.5">
                  At 14% safe market CAGR
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] uppercase font-mono text-[var(--warning)] block font-semibold">
                  3. If Deadline is Fixed
                </span>
                <span className="text-base font-bold font-mono text-[var(--warning)] block mt-0.5">
                  {shortTerm.formatted_needed_sip} SIP
                </span>
                <span className="text-[11px] text-[var(--text-3)] block mt-0.5">
                  Requires {shortTerm.formatted_needed_ctc} CTC
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-2)] mt-2">
              💡 <strong>Actionable Recommendation:</strong> To grow wealth safely without gambling, set your timeline to <strong>~{shortTerm.safe_alternative_years || 15} years</strong> or adjust your short-term target to <strong>{shortTerm.formatted_projected}</strong>.
            </p>
          </div>
        )}

        {/* Career leverage insight for standard off-track state */}
        {!isOnTrack && shortTerm.verdict !== 'UNREALISTIC_TIMELINE' && shortTerm.career_leverage_needed && shortTerm.formatted_needed_sip && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(217,119,6,0.2)',
            fontSize: '13px',
            color: 'var(--text-2)',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: '1.6',
          }}>
            <strong style={{ color: 'var(--text-1)' }}>Market returns alone cannot close this gap.</strong>{' '}
            To reach {shortTerm.formatted_target} by {endYear}, your monthly SIP needs to be{' '}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--warning)' }}>
              {shortTerm.formatted_needed_sip}
            </span>
            {shortTerm.needed_ctc_annual_lpa && (
              <>, which requires a CTC of approximately{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--warning)' }}>
                {shortTerm.needed_ctc_annual_lpa.toFixed(1)} LPA
              </span>.</>
            )}
          </div>
        )}

        {/* Purchasing power note */}
        {dynamicNote && (
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: 'var(--text-3)',
            fontFamily: "'Outfit', sans-serif",
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start',
          }}>
            <Info style={{ width: '13px', height: '13px', flexShrink: 0, marginTop: '1px' }} />
            <span>{dynamicNote}</span>
          </div>
        )}
      </div>

      {/* ── Purchasing Power Analysis ── */}
      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        {/* Section header + sliders */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h3 style={sectionHeading}>Purchasing Power Analysis</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
              Gross nominal wealth vs. real purchasing power after tax and inflation.
            </p>
          </div>

          {/* Sliders */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Inflation slider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 10px',
            }}>
              <label htmlFor="inflation-slider" style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                Inflation
              </label>
              <input
                id="inflation-slider"
                type="range"
                min="3.0" max="12.0" step="0.5"
                value={inflationRate}
                onChange={e => setInflationRate(parseFloat(e.target.value))}
                style={{ width: '80px', cursor: 'pointer' }}
                aria-label={`Inflation rate: ${inflationRate} percent`}
                aria-valuemin="3"
                aria-valuemax="12"
                aria-valuenow={inflationRate}
              />
              <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)', minWidth: '36px' }}>
                {inflationRate}%
              </span>
            </div>

            {/* LTCG tax selector */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 10px',
            }}>
              <label htmlFor="ltcg-select" style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                LTCG Tax
              </label>
              <select
                id="ltcg-select"
                value={String(taxRate)}
                onChange={e => setTaxRate(parseFloat(e.target.value))}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`LTCG tax rate: ${taxRate} percent`}
              >
                <option value="12.5">12.5% (Budget 2024)</option>
                <option value="10">10% (Old)</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dual pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Pillar 1: Gross Nominal */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gross nominal
            </p>
            <p style={monoVal}>{format_indian_currency(grossRaw)}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginTop: '6px', lineHeight: '1.5' }}>
              Total capital before tax or inflation adjustment.
            </p>
            {/* Full bar */}
            <div style={{ marginTop: '12px', height: '6px', borderRadius: '9999px', backgroundColor: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent)', borderRadius: '9999px' }} />
            </div>
          </div>

          {/* Pillar 2: Real Purchasing Power */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real purchasing power ({new Date().getFullYear()} money)
            </p>
            <p style={{ ...monoVal, color: 'var(--success)' }}>{format_indian_currency(realPower)}</p>

            {/* Loss badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--danger)', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '4px', padding: '2px 6px' }}>
                −{format_indian_currency(calculatedTax)} tax
              </span>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-3)', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px' }}>
                −{format_indian_currency(inflationLossRaw)} inflation
              </span>
            </div>

            {/* Segmented bar */}
            <div style={{ marginTop: '12px', height: '6px', borderRadius: '9999px', backgroundColor: 'var(--surface-2)', overflow: 'hidden', display: 'flex', gap: '2px' }}>
              <div style={{ width: `${realPowerPct}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
              <div style={{ width: `${inflationLossPct}%`, height: '100%', backgroundColor: 'var(--text-3)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
              <div style={{ width: `${taxPct}%`, height: '100%', backgroundColor: 'var(--danger)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--text-3)', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ color: 'var(--success)' }}>{realPowerPct.toFixed(0)}% real</span>
              <span>{inflationLossPct.toFixed(0)}% inflation</span>
              <span style={{ color: 'var(--danger)' }}>{taxPct.toFixed(0)}% tax</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Area Chart ── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={sectionHeading}>Wealth growth {startYear} → {endYear}</h3>
        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2f81f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2f81f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="year"
                stroke="var(--border)"
                tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Outfit' }}
              />
              <YAxis
                stroke="var(--border)"
                tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Outfit' }}
                tickFormatter={yAxisFormatter}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="corpusRaw"
                stroke="#2f81f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#accentGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#2f81f7', stroke: 'var(--surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Career Roadmap Table ── */}
      <div>
        <h3 style={{ ...sectionHeading, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase style={{ width: '13px', height: '13px' }} />
          Career & wealth roadmap {startYear} → {endYear}
        </h3>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)', maxHeight: '360px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0 }}>
                {['Year', 'Role / milestone', 'Target CTC', 'Monthly SIP', 'Projected corpus'].map(h => (
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
              {careerRoadmap.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600', color: 'var(--accent)', fontSize: '13px' }}>
                    {row.year}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontWeight: '500' }}>
                    {row.role}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-1)', fontSize: '13px' }}>
                    {row.formatted_ctc || `₹${row.suggested_ctc_lpa} LPA`}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)', fontSize: '13px' }}>
                    {row.formatted_sip}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600', color: 'var(--text-1)', fontSize: '13px' }}>
                    {row.formatted_corpus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
