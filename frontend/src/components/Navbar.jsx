import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, setTheme, onOpenCasModal, onOpenAaModal, aaSession }) {
  const isLight = theme === 'light';
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: '56px',
      backgroundColor: isLight ? 'rgba(240,244,248,0.92)' : 'rgba(10,14,26,0.92)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="relative group cursor-pointer flex items-center">
            <img
              src="/LOGO.png"
              alt="InvestPro Royal Bull Logo"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(226,185,111,0.35)]"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: '18px', fontWeight: '800',
                letterSpacing: '0.04em',
              }} className="text-gold-gradient">
                INVESTPRO
              </span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold" style={{
                backgroundColor: 'rgba(226,185,111,0.12)',
                color: 'var(--accent-bright)',
                border: '1px solid rgba(226,185,111,0.25)',
                letterSpacing: '0.05em'
              }}>
                EST. 2026
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] uppercase font-semibold" style={{
              letterSpacing: '0.12em',
              color: 'var(--text-3)',
              fontFamily: "'Outfit', sans-serif",
              marginTop: '-2px',
            }}>
              Digital Family Office
            </span>
          </div>
        </div>

        {/* Action buttons & Theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* RBI Account Aggregator Button */}
          <button
            onClick={onOpenAaModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              aaSession
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${aaSession ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="hidden sm:inline">
              {aaSession ? `RBI AA: ${aaSession.formatted_current_valuation}` : 'Sync via RBI AA'}
            </span>
            <span className="sm:hidden">
              {aaSession ? 'AA Synced' : 'RBI AA'}
            </span>
          </button>

          {/* CAS PDF Ingestion */}
          <button
            onClick={onOpenCasModal}
            className="btn-gold flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="hidden sm:inline">Import CAS</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            aria-label="Toggle theme"
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >
            {isLight ? <Moon style={{ width: '15px', height: '15px' }} /> : <Sun style={{ width: '15px', height: '15px' }} />}
          </button>
        </div>
      </div>
    </header>
  );
}
