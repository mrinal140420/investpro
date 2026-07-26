import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, setTheme }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 11 L5.5 6.5 L9 9 L13 3.5" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: '700',
              color: 'var(--text-1)', letterSpacing: '-0.02em',
            }}>InvestPro</span>
            <span className="hidden sm:inline" style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '12px',
              color: 'var(--text-3)', fontWeight: '400',
            }}>Investment Planner</span>
          </div>
        </div>

        {/* Theme toggle */}
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
    </header>
  );
}
