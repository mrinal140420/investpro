# Implementation Plan: InvestPro Professional Redesign

## Overview

Rewrite the InvestPro frontend from a prototype aesthetic to a professional fintech product. All tasks are purely frontend (JSX, CSS, Tailwind config). No backend logic changes. Each task builds on the previous, ending with wired-together, fully integrated components.

The implementation language is JavaScript (React/JSX), using fast-check + React Testing Library for property and unit tests.

---

## Tasks

- [ ] 1. Design token system — rewrite `index.css` and update Tailwind config in `index.html`
  - Remove all decorative CSS: grid/radial `body { background-image }`, `@keyframes floatUp`, `.animate-float-up`, `@keyframes alarmFlash`, `.animate-alarm-flash`, cyan glow scrollbar thumb
  - Define CSS custom properties on `:root` (dark) and `html.light` (light) for all 10 design tokens listed in the design doc
  - Update range slider thumb color from cyan to `#2563EB`
  - Retain `@keyframes spinSlow`, `.spin-slow`, range slider track/thumb structure, `transition-colors`
  - Update `tailwind.config` in `index.html`: add `surface`, `surface-raised`, `border`, `muted`, `accent`, `success`, `warning`, `danger` color utilities mapping to CSS vars
  - Update `index.html` `<title>` to "InvestPro — Investment Planner" and remove `vite.svg` favicon reference
  - Update `fontFamily` config to use `Outfit` as default and keep `JetBrains Mono` as `font-mono`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.4, 11.5_

- [ ] 2. Rewrite Navbar component
  - [ ] 2.1 Implement redesigned Navbar
    - Replace entire `Navbar.jsx` with new markup using `sticky top-0 z-50 h-14 border-b border-border bg-surface/90 backdrop-blur-sm` structure
    - Left: "InvestPro" wordmark (font-semibold) + "Investment Planner" subtitle (`text-sm text-muted`)
    - Right: icon-only theme toggle button (`<Sun />` in dark mode, `<Moon />` in light mode) with `focus-visible:ring-2 ring-accent`
    - Remove ShieldCheck icon, gradient border, version badge, AMFI badge, Groww link
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.2 Write unit tests for Navbar
    - Test that "InvestPro" and "Investment Planner" are rendered
    - Test that theme toggle button renders Sun icon in dark mode and Moon icon in light mode
    - Test that "AMFI", "DSS", "Groww" strings are absent from rendered output
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [ ] 3. Rewrite InteractiveControlPanel → "Portfolio Parameters"
  - [ ] 3.1 Implement redesigned control panel
    - Replace heading with "Portfolio Parameters"
    - Apply unified input style to all inputs and selects: `bg-surface-raised border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent`
    - Update all labels to sentence-case Outfit: "Monthly SIP", "Lump sum", "Target corpus", "Time horizon", "Annual CTC", "Risk strategy"
    - Add `id` attributes to all inputs and matching `htmlFor` on labels
    - Rename risk strategy options to "Aggressive Barbell (Small Cap + Momentum)", "Ultra-Aggressive (70% Growth Assets)", "Balanced (Index + Liquid + Gold)"
    - Replace ₹10k preset button with nothing; replace ₹50L, ₹1 Cr, ₹3 Cr preset buttons with `<button type="button" class="text-xs text-accent">` inline text links
    - Remove "Age 30 Target (April 2035)" from time horizon select options
    - Remove gradient top stripe (`absolute h-0.5 bg-gradient...`)
    - Remove `hover:-translate-y-1` from all field wrapper divs
    - Style Recalculate button: `bg-accent text-white rounded-md px-4 py-2 text-sm font-medium`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 11.2, 11.3_

  - [ ]* 3.2 Write unit tests for control panel
    - Test "Portfolio Parameters" heading is present
    - Test "Age 30 Target" option is absent from select
    - Test ₹50L/₹1 Cr/₹3 Cr links are rendered as text links (not styled buttons)
    - Test all labels have matching `htmlFor`/`id` pairs
    - _Requirements: 3.1, 3.9, 3.12, 11.3_

- [ ] 4. Rewrite validation empty state card
  - [ ] 4.1 Implement redesigned validation card
    - Replace `AlertCircle` icon with `BarChart2`
    - Update heading to "Complete your profile to see projections"
    - Add context sentence: "InvestPro calculates whether your current SIP and salary trajectory can hit your corpus target by your deadline — and tells you exactly what needs to change if not."
    - Replace emoji labels in checklist items with plain text labels (no ⚡🎯📅💼)
    - Replace colored "Required" badge pills with a simple grey dot indicator for unfilled fields
    - Remove all quick-start preset buttons (rocket, gem, target presets)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 4.2 Write unit tests for validation card
    - Test "Complete your profile to see projections" heading is present
    - Test that no emoji characters appear in the checklist labels
    - Test that filled fields show a green checkmark and unfilled show a grey indicator
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [ ] 5. Rewrite GhostTrajectoryCard → WealthProjectionCard
  - [ ] 5.1 Implement redesigned WealthProjectionCard
    - Rename component to `WealthProjectionCard`, rename file to `WealthProjectionCard.jsx`
    - Replace heading "Ghost Trajectory & Dynamic Timeline Engine" with "Wealth Projection"
    - Remove floating ₹ rain overlay (`isOnTrack && [...Array(15)].map(...)` block) entirely
    - Update on-track badge: plain "On Track" text, no emoji, no `animate-bounce`, no "PAISA UDDE"
    - Update status banner to `rounded-lg p-4` structure; render `shortTerm.message` as `text-sm` prose directly
    - Add career leverage insight block for off-track state: "Market returns alone cannot close this gap. To reach {formatted_target} by {year}, your monthly SIP needs to be {formatted_needed_sip}, which requires a CTC of approximately {needed_ctc_annual_lpa} LPA."
    - Rename inner section heading to "Purchasing Power Analysis"
    - Replace animated pulse bar in Pillar 1 with a plain full-width bar using `bg-accent`
    - Replace multi-color segmented bar logic to use `bg-accent` (real value), `bg-muted` (inflation loss), `bg-danger` (tax) segments
    - Update chart: `stroke="#2563EB"`, fill gradient `rgba(37,99,235,0.25)` to transparent, axis/tooltip colors use CSS vars
    - Career roadmap table: headers `text-xs text-muted uppercase`, remove per-row "TARGET HIT" badge span
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12_

  - [ ]* 5.2 Write property test: on-track banner contains no emoji or animation markers
    - **Property 1: On-track banner contains no emoji or animation markers**
    - Generate arbitrary trajectoryData objects with `verdict: 'ON_TRACK'` using fast-check
    - Assert rendered output does not contain "PAISA UDDE", "🎉", "animate-bounce", "animate-float-up"
    - **Validates: Requirements 5.2, 5.12**

  - [ ]* 5.3 Write property test: backend message string is always rendered
    - **Property 2: Backend message string is always rendered as visible text**
    - Generate arbitrary non-empty message strings using fast-check
    - Assert rendered WealthProjectionCard contains the message string verbatim in its text content
    - **Validates: Requirements 5.3**

  - [ ]* 5.4 Write unit tests for WealthProjectionCard
    - Test "Wealth Projection" heading is present
    - Test career leverage insight appears for CAREER_LEVERAGE_REQUIRED fixture
    - Test "INTERACTIVE WEALTH EROSION" and "PAISA UDDE" strings are absent
    - _Requirements: 5.1, 5.4, 5.5_

- [ ] 6. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Rewrite BarbellPortfolioCard → RecommendedPortfolioCard
  - [ ] 7.1 Implement redesigned RecommendedPortfolioCard
    - Rename component to `RecommendedPortfolioCard`, rename file to `RecommendedPortfolioCard.jsx`
    - Replace heading with "Recommended Portfolio"
    - Add strategy label pill at top: `<span class="text-xs border border-border rounded-full px-2 py-0.5 text-muted">` with human-readable strategy name derived from `fundUniverse.risk_mode`
    - Add bucket tag per row: `<span class="text-xs text-muted">{item.bucket}</span>` adjacent to fund name
    - Update risk badge colors: Very High/High → `text-danger bg-danger/10 border-danger/20`, Moderate-High → `text-warning`, Low/Low-Moderate → `text-success`
    - Display returns as plain `font-mono text-sm` values with `text-xs text-muted` labels (3Y / 5Y / ALL), removing colored wrappers
    - Replace Groww button with inline `<a class="text-accent text-xs inline-flex items-center gap-1">Groww <ExternalLink /></a>`
    - Replace gradient summary box with `<div class="border-t pt-4 flex justify-between">` showing Portfolio CAGR and Total Annual Growth
    - Remove all `Sparkles` icons, remove allocation weight badge pills from fund name cell
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 7.2 Write property test: strategy pill reflects risk_mode
    - **Property 3: Strategy pill reflects risk_mode for all valid inputs**
    - Generate fundUniverse with random risk_mode from `{ 'aggressive', 'ultra_aggressive', 'balanced' }` using fast-check
    - Assert rendered RecommendedPortfolioCard contains a non-empty strategy label derived from risk_mode
    - **Validates: Requirements 6.2**

  - [ ]* 7.3 Write property test: every asset has bucket label and row rendered
    - **Property 4: Every asset in asset_breakdown has its bucket label rendered**
    - Generate fundUniverse with 1–10 arbitrary assets using fast-check
    - Assert each asset's `bucket` value appears in rendered output, and total row count equals array length
    - **Validates: Requirements 6.3, 9.3**

  - [ ]* 7.4 Write property test: risk badge color consistency
    - **Property 5: Risk badge color is consistent with risk_level for all inputs**
    - Generate all risk_level values using fast-check enum sampler
    - Assert each rendered badge contains correct color token class
    - **Validates: Requirements 6.4**

  - [ ]* 7.5 Write unit tests for RecommendedPortfolioCard
    - Test "Recommended Portfolio" heading present
    - Test Sparkles icon absent
    - Test gradient summary box (`from-emerald-500/10`) class absent
    - _Requirements: 6.1, 6.8, 6.9_

- [ ] 8. Rewrite CircuitBreakerCard → RiskMonitorsCard (with AUM Bloat section)
  - [ ] 8.1 Implement redesigned RiskMonitorsCard with SMA section
    - Rename component to `RiskMonitorsCard`, rename file to `RiskMonitorsCard.jsx`
    - Replace heading with "Risk Monitors"
    - Remove `isCrashSimulated` state, crash simulation toggle button, Flame icon, `animate-alarm-flash`, "DEATH CROSS DETECTED!" banner
    - Render two stat tiles: SMA 50 and SMA 200 values in `font-mono`
    - Add SMA status line: green dot + "Bullish — SMA 50 above SMA 200" when sma50 > sma200; red dot + "Bearish — SMA 50 below SMA 200" otherwise
    - Add prose explanation of circuit breaker purpose
    - Add disclaimer: `text-xs text-muted italic` — "SMA values are indicative. Computed from daily AMFI NAV data."
    - Accept `circuitData` prop (array of SMACrossoverResult); derive sma50/sma200 from first Accelerator fund in data (or use placeholder values if null)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ] 8.2 Implement AUM Bloat Monitor section in RiskMonitorsCard
    - Add `border-t mt-4 pt-4` section below SMA tiles
    - Heading: "AUM Bloat Monitor"
    - Threshold note: "Small-cap and momentum funds lose agility above ₹10,000 Crore AUM."
    - Map over `aumData` prop to render fund rows: fund name, AUM in font-mono, status pill
    - Status pill colors: HEALTHY → success-colored, WARNING → warning-colored, BLOATED → danger-colored
    - Disclaimer: `text-xs text-muted italic` — "AUM data updated via daily pipeline."
    - When `aumData` is null or empty: render `text-sm text-muted` placeholder
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 8.3 Write property test: SMA status label from numeric comparison
    - **Property 6: SMA status label is determined solely by numeric comparison**
    - Generate random pairs of positive floats `(sma50, sma200)` using fast-check
    - Assert rendered status label is "Bullish..." iff sma50 > sma200 and "Bearish..." iff sma50 < sma200
    - **Validates: Requirements 7.3, 7.4**

  - [ ]* 8.4 Write property test: AUM status pill color matches status
    - **Property 7: AUM status pill color matches status value**
    - Generate AUM fund entries with status sampled from `{ 'HEALTHY', 'WARNING', 'BLOATED' }` using fast-check
    - Assert rendered pill contains the correct token color class for each status
    - **Validates: Requirements 8.3**

  - [ ]* 8.5 Write unit tests for RiskMonitorsCard
    - Test "Risk Monitors" heading present
    - Test crash simulation button absent
    - Test "DEATH CROSS DETECTED!" string absent
    - Test AUM section heading "AUM Bloat Monitor" present
    - Test null aumData renders placeholder text
    - _Requirements: 7.1, 7.7, 7.9, 8.1, 8.6_

- [ ] 9. Rewrite DirectivesFeed → ExecutionDirectivesFeed
  - [ ] 9.1 Implement redesigned ExecutionDirectivesFeed
    - Rename component to `ExecutionDirectivesFeed`, rename file to `ExecutionDirectivesFeed.jsx`
    - Replace heading with "Execution Directives"
    - Accept `fundUniverse` prop; derive rows from `fundUniverse.asset_breakdown`
    - Each row: green BUY badge, fund name, `allocated_sip` formatted in `font-mono`, inline Groww link as `text-accent text-xs`
    - Rows use `divide-y divide-border` layout — no nested card wrappers per row
    - Add placeholder note paragraph: "PAUSE SIP directives appear here when the circuit breaker triggers a momentum breakdown."
    - Demote Telegram button to `text-xs text-muted underline`
    - When `fundUniverse` is null: render `<p class="text-sm text-muted">Configure your portfolio to see directives.</p>`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 9.2 Write property test: directive rows match asset_breakdown length
    - **Property 8: Directive rows match asset_breakdown length**
    - Generate fundUniverse with 1–8 assets using fast-check
    - Assert rendered ExecutionDirectivesFeed has exactly N directive rows where N = `asset_breakdown.length`
    - **Validates: Requirements 9.3**

  - [ ]* 9.3 Write unit tests for ExecutionDirectivesFeed
    - Test "Execution Directives" heading present
    - Test null fundUniverse renders placeholder string
    - Test Telegram button uses underline/muted style, not primary button class
    - _Requirements: 9.1, 9.7, 9.8_

- [ ] 10. Update App.jsx — theme sync, layout, loading state, prop wiring
  - [ ] 10.1 Implement theme sync fix and layout updates in App.jsx
    - Replace split theme logic (useState + separate useEffect) with single handler: `const handleToggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('theme', next); document.documentElement.classList.toggle('light', next === 'light'); }`
    - Initialize theme from `localStorage.getItem('theme') || 'dark'` on useState
    - Clear `params.dob` default: change `"2005-04-14"` to `""`
    - Remove `far_target_date: "2035-04-14"` and `far_target_amount: 30000000.0` from initial params (or set to neutral values)
    - Replace loading spinner text with 3 skeleton blocks: `<div class="rounded-lg bg-surface-raised animate-pulse h-[400px]">`, `h-[300px]`, `h-[200px]`
    - Remove `hover:-translate-y-1` from all card wrapper divs in the results grid
    - Pass `fundUniverse` as prop to `ExecutionDirectivesFeed`
    - Update imports to use renamed component files: `WealthProjectionCard`, `RecommendedPortfolioCard`, `RiskMonitorsCard`, `ExecutionDirectivesFeed`
    - Wire `circuitData` and `aumData` states: fetch from `/api/v1/risk/circuit-breaker` and `/api/v1/risk/aum-bloat` on load; pass as props to `RiskMonitorsCard`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 10.2 Write unit tests for App theme sync
    - Test that initial theme is read from localStorage
    - Test that toggle handler updates all three targets (state, localStorage, document class) synchronously
    - Test skeleton blocks render when `loading === true` and `trajectoryData === null`
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11. Final cleanup — copy audit, typography, accessibility
  - Remove any remaining instances of "DSS", "Command Center", "Casino Exit", "PAISA UDDE", "Ghost Trajectory Engine", "Wealth Command Center", "DSS V6.0" from all JSX files (search all `.jsx`)
  - Audit all numeric display values: ensure `font-mono` applied consistently; ensure labels/headings use Outfit (default sans)
  - Verify `focus-visible:ring-2 ring-accent` on all interactive elements: buttons, inputs, selects, `<a>` tags
  - Verify all `<label>` elements have `htmlFor` matching a sibling `id`
  - Update `ErrorBoundary` fallback: remove emoji from "⚠️ Dashboard Component Render Error" heading
  - _Requirements: 11.1, 11.2, 11.3, 11.6_

- [ ] 12. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Component file renames (e.g., `GhostTrajectoryCard.jsx` → `WealthProjectionCard.jsx`) require updating the import in `App.jsx` — Task 10.1 handles all import updates
- The AUM Bloat and Circuit Breaker API endpoints (`/api/v1/risk/aum-bloat`, `/api/v1/risk/circuit-breaker`) may not yet exist in the backend router — Task 8 should add placeholder UI that degrades gracefully if data is null
- No backend changes are required; all property tests run against the pure render functions of the redesigned components
- Property tests use fast-check with default 100 iterations per run

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "7.1"] },
    { "id": 4, "tasks": ["7.2", "7.3", "7.4", "7.5", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3", "8.4", "8.5", "9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 7, "tasks": ["10.2", "11"] }
  ]
}
```
