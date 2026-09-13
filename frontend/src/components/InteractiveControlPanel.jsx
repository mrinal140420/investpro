import React from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';

function FieldInput({ id, label, children, hint }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      padding: '14px 16px',
    }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '11px', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--text-3)', marginBottom: '8px',
        fontFamily: "'Outfit', sans-serif",
      }}>{label}</label>
      {children}
      {hint && (
        <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px', fontFamily: "'Outfit', sans-serif" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function InteractiveControlPanel({ params, setParams, onRecalculate, loading, validation }) {
  const { isFormValid } = validation || {};

  const handleChange = (field, rawValue) => {
    const val = rawValue === '' ? 0 : parseFloat(rawValue) || 0;
    setParams(prev => ({ ...prev, [field]: val }));
  };

  const setTargetPreset = (amount, targetDate) => {
    setParams(prev => ({ ...prev, near_target_amount: amount, near_target_date: targetDate }));
  };

  return (
    <div className="ip-card accent-stripe">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'var(--accent-glow)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <SlidersHorizontal style={{ width: '16px', height: '16px', color: 'var(--accent-bright)' }} />
          </div>
          <div>
            <h2 className="ip-heading" style={{ fontSize: '16px', marginBottom: '1px' }}>
              Portfolio Parameters
            </h2>
            <p className="ip-body" style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              Configure SIP, target corpus, and strategy
            </p>
          </div>
        </div>

        <button
          onClick={onRecalculate}
          disabled={loading || !isFormValid}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-sans transition-all shadow-md ${
            isFormValid ? 'btn-gold cursor-pointer' : 'bg-[var(--surface-3)] text-[var(--text-3)] cursor-not-allowed opacity-60'
          }`}
        >
          <RefreshCw style={{ width: '13px', height: '13px' }} className={loading ? 'spin-slow' : ''} />
          <span>{loading ? 'Recalculating...' : 'Recalculate Strategy'}</span>
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3">

        {/* Monthly SIP */}
        <FieldInput id="monthly-sip" label="Monthly SIP">
          <input id="monthly-sip" type="number" placeholder="25,000"
            value={params.monthly_investable_sip === 0 ? '' : params.monthly_investable_sip}
            onChange={e => handleChange('monthly_investable_sip', e.target.value)}
          />
          <input type="range" min="0" max="200000" step="1000"
            value={params.monthly_investable_sip || 0}
            onChange={e => handleChange('monthly_investable_sip', e.target.value)}
            style={{ marginTop: '10px' }}
            aria-label="Monthly SIP slider"
          />
        </FieldInput>

        {/* Lump Sum */}
        <FieldInput id="lump-sum" label="Lump sum"
          hint={params.lump_sum_amount > 0
            ? `₹${params.lump_sum_amount.toLocaleString('en-IN')}`
            : 'Optional initial capital'}>
          <input id="lump-sum" type="number" step="5000" placeholder="0"
            value={params.lump_sum_amount === 0 ? '' : params.lump_sum_amount}
            onChange={e => handleChange('lump_sum_amount', e.target.value)}
          />
        </FieldInput>

        {/* Target Corpus */}
        <FieldInput id="target-corpus" label="Target corpus">
          <input id="target-corpus" type="number" step="100000" placeholder="50,00,000"
            value={params.near_target_amount === 0 ? '' : params.near_target_amount}
            onChange={e => handleChange('near_target_amount', e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '7px' }}>
            {[{ label: '₹50L', amount: 5000000, date: '2028-12-31' },
              { label: '₹1 Cr', amount: 10000000, date: '2031-12-31' },
              { label: '₹3 Cr', amount: 30000000, date: '2036-12-31' }
            ].map(p => (
              <button key={p.label} type="button"
                onClick={() => setTargetPreset(p.amount, p.date)}
                style={{
                  fontSize: '11px', fontWeight: '500',
                  color: 'var(--accent-bright)', background: 'var(--accent-glow)',
                  border: '1px solid var(--accent-border)', borderRadius: '4px',
                  padding: '2px 7px', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", transition: 'all 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.25)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-glow)'}
              >{p.label}</button>
            ))}
          </div>
        </FieldInput>

        {/* Time Horizon */}
        <FieldInput id="time-horizon" label="Time horizon">
          <select id="time-horizon" value={params.near_target_date || ''}
            onChange={e => setParams(prev => ({ ...prev, near_target_date: e.target.value }))}>
            <option value="">Select horizon...</option>
            <option value="2026-12-31">~6 months (Dec 2026)</option>
            <option value="2027-12-31">~1.5 years (Dec 2027)</option>
            <option value="2028-12-31">~2.5 years (Dec 2028)</option>
            <option value="2031-12-31">~5 years (Dec 2031)</option>
            <option value="2036-12-31">~10 years (Dec 2036)</option>
            <option value="2041-12-31">~15 years (Dec 2041)</option>
            <option value="2046-12-31">~20 years (Dec 2046)</option>
            <option value="2051-12-31">~25 years (Dec 2051)</option>
          </select>
        </FieldInput>

        {/* Annual CTC */}
        <FieldInput id="annual-ctc" label="Annual CTC"
          hint={params.current_ctc_lpa > 0
            ? `~₹${Math.round((params.current_ctc_lpa * 100000 / 12) * 0.85).toLocaleString('en-IN')}/mo take-home`
            : 'In lakhs per annum'}>
          <input id="annual-ctc" type="number" step="0.5" placeholder="12.0"
            value={params.current_ctc_lpa === 0 ? '' : params.current_ctc_lpa}
            onChange={e => handleChange('current_ctc_lpa', e.target.value)}
          />
        </FieldInput>

        {/* Annual SIP Step-Up */}
        <FieldInput id="step-up-pct" label="Annual SIP Step-Up"
          hint={((params.annual_step_up_pct !== undefined && params.annual_step_up_pct !== null) ? Number(params.annual_step_up_pct) : 0.10) === 0
            ? '0% Flat SIP (No salary step-up applied)'
            : `Increases SIP by ${Math.round(((params.annual_step_up_pct !== undefined && params.annual_step_up_pct !== null) ? Number(params.annual_step_up_pct) : 0.10) * 100)}% every year with salary growth`}>
          <select
            id="step-up-pct"
            value={((params.annual_step_up_pct !== undefined && params.annual_step_up_pct !== null) ? Number(params.annual_step_up_pct) : 0.10).toFixed(2)}
            onChange={e => handleChange('annual_step_up_pct', e.target.value)}
          >
            <option value="0.00">0% (Flat SIP - No Step-Up)</option>
            <option value="0.05">5% Annual Step-Up (Conservative)</option>
            <option value="0.10">10% Annual Step-Up (Recommended)</option>
            <option value="0.15">15% Annual Step-Up (Aggressive Career Growth)</option>
            <option value="0.20">20% Annual Step-Up (High Accelerator)</option>
            <option value="0.25">25% Annual Step-Up (Super Aggressive)</option>
          </select>
          <div style={{ display: 'flex', gap: '6px', marginTop: '7px' }}>
            {[
              { label: '0% Flat', val: 0.0 },
              { label: '10% Rec', val: 0.10 },
              { label: '15% High', val: 0.15 },
              { label: '20% Max', val: 0.20 }
            ].map(s => {
              const currentVal = (params.annual_step_up_pct !== undefined && params.annual_step_up_pct !== null) ? Number(params.annual_step_up_pct) : 0.10;
              const isSelected = Math.abs(currentVal - s.val) < 0.001;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleChange('annual_step_up_pct', s.val)}
                  style={{
                    fontSize: '10px',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#111827' : 'var(--accent-bright)',
                    background: isSelected ? 'var(--gold)' : 'var(--accent-glow)',
                    border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--accent-border)'}`,
                    borderRadius: '4px',
                    padding: '2px 6px',
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.12s',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </FieldInput>

        {/* Risk Strategy */}
        <FieldInput id="risk-strategy" label="Multi-Asset Strategy">
          <select id="risk-strategy" value={params.risk_mode}
            onChange={e => setParams(prev => ({ ...prev, risk_mode: e.target.value }))}>
            <option value="global_multi_asset">🌐 Global Multi-Asset (INDmoney Style)</option>
            <option value="ultra_aggressive">🚀 High-Alpha Tech & Small Cap</option>
            <option value="balanced">🛡️ All-Weather Balanced (Gold & S&P 500)</option>
          </select>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px', fontFamily: "'Outfit', sans-serif" }}>
            {params.risk_mode === 'global_multi_asset' && 'Small Cap (25%) + S&P 500 (20%) + Momentum (20%) + Nifty 50 + Silver'}
            {params.risk_mode === 'ultra_aggressive' && 'Small Cap (35%) + S&P 500 (25%) + Momentum (20%) + Next 50 + Silver'}
            {params.risk_mode === 'balanced' && 'Nifty 50 (25%) + S&P 500 (20%) + Gold FoF (20%) + Liquid (20%) + Small Cap'}
          </p>
        </FieldInput>

      </div>
    </div>
  );
}
