# Requirements Document

## Introduction

InvestPro is a quantitative wealth decision-support system with three investment strategies, a real NAV data pipeline, SMA-based circuit breaker logic, AUM bloat detection, and a Telegram directive system. The current frontend uses hardcoded placeholder values, hides existing features (AUM Bloat Scanner has no UI), uses informal internal jargon, and includes gimmick animations. This professional redesign makes the full product visible, credible, and usable — targeting a clean fintech aesthetic aligned with Zerodha/INDmoney standards.

All existing backend API connections and calculation logic remain unchanged. Only the frontend presentation, copy, component structure, and visual design are changed.

## Glossary

- **InvestPro**: The application being redesigned.
- **Design System**: The set of CSS custom properties, Tailwind utility mappings, and typography rules applied globally.
- **Accent Color**: The single brand color `#2563EB` (blue-600), used for interactive elements, links, and highlights.
- **Status Colors**: Green (`#16a34a`) for healthy/on-track states; Amber (`#d97706`) for warnings; Red (`#dc2626`) for critical/bearish states.
- **font-mono**: JetBrains Mono, used exclusively for numeric data display.
- **Outfit**: The sans-serif typeface used for all labels, headings, and prose.
- **Token**: A named CSS custom property (e.g., `--color-surface`) mapped to a Tailwind utility (e.g., `bg-surface`).
- **SMA Circuit Breaker**: The 50-day vs 200-day Simple Moving Average crossover logic that triggers SIP pause or resume directives.
- **AUM Bloat Scanner**: The backend service that monitors fund Assets Under Management against a ₹10,000 Crore threshold.
- **Ghost Trajectory**: The backend wealth projection engine; renamed "Wealth Projection" in the UI.
- **Barbell Portfolio**: The multi-asset fund recommendation engine; renamed "Recommended Portfolio" in the UI.
- **Execution Directives**: The renamed DirectivesFeed component showing per-fund BUY/PAUSE actions.
- **Risk Monitors**: The renamed component combining the SMA Circuit Breaker and AUM Bloat Scanner sections.
- **Bucket**: A fund category label — Anchor, Accelerator, Debt Shield, or Hedge.

---

## Requirements

### Requirement 1: Design Token System and Global Styles

**User Story:** As a user, I want the application to use a consistent, professional color palette and typography, so that the interface feels like a credible fintech product rather than an experimental prototype.

#### Acceptance Criteria

1. THE Design_System SHALL define CSS custom properties for all theme colors in both dark and light modes, using the specified values: dark background `#020617`, dark surface `#0f172a`, dark surface-raised/border `#1e293b`, dark text-primary `#f1f5f9`, dark text-secondary `#94a3b8`, accent `#2563eb`, success `#16a34a`, warning `#d97706`, danger `#dc2626`; light background `#f8fafc`, light surface `#ffffff`, light surface-raised `#f1f5f9`, light border `#e2e8f0`, light text-primary `#0f172a`.
2. THE Design_System SHALL map all tokens as named Tailwind utilities: `bg-surface`, `bg-surface-raised`, `text-muted`, `border-border`, `text-success`, `text-warning`, `text-danger`, `bg-accent`.
3. THE Design_System SHALL remove the following decorative elements from `index.css`: grid background pattern, radial gradient overlays on `body`, glowing cyan scrollbar thumb, `animate-float-up` keyframe and class, `animate-alarm-flash` keyframe and class.
4. THE Design_System SHALL retain the `spin-slow` utility, range slider styling, and `transition-colors` behavior.
5. THE Design_System SHALL set `font-family` to Outfit for all body text, with JetBrains Mono available as `font-mono`.
6. WHEN the user toggles theme, THE Design_System SHALL update `document.documentElement` class, React state, and `localStorage` in a single handler with no race conditions.

---

### Requirement 2: Navbar Redesign

**User Story:** As a user, I want a clean, minimal navigation bar, so that the product feels professional and not cluttered with internal badges or redundant links.

#### Acceptance Criteria

1. THE Navbar SHALL display the "InvestPro" wordmark on the left with a subtitle of "Investment Planner" in `text-sm text-muted` Outfit font.
2. THE Navbar SHALL display an icon-only theme toggle button on the right, showing a sun icon in dark mode and a moon icon in light mode.
3. THE Navbar SHALL use the structural class: `sticky top-0 z-50 h-14 border-b border-border bg-surface/90 backdrop-blur-sm`.
4. THE Navbar SHALL NOT render the pulsing "AMFI Live Feed Connected" badge.
5. THE Navbar SHALL NOT render the "Groww 1-Click" external link.
6. THE Navbar SHALL NOT render the `ShieldCheck` icon logo or the gradient border on the brand container.
7. THE Navbar SHALL NOT display the "DSS V6.0" version badge or any internal version identifiers.

---

### Requirement 3: Portfolio Parameters Panel Redesign

**User Story:** As a user, I want a clean, professional input panel with clear labels, so that I can configure my investment parameters without confusion from informal or technical jargon.

#### Acceptance Criteria

1. THE Control_Panel SHALL use the section heading "Portfolio Parameters" instead of "Dynamic Capital Control Center".
2. THE Control_Panel SHALL apply a unified input style: `bg-surface-raised border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent` to all text inputs and selects.
3. THE Control_Panel SHALL use sentence-case Outfit labels: Monthly SIP, Lump sum, Target corpus, Time horizon, Annual CTC, Risk strategy.
4. THE Control_Panel SHALL display risk strategy dropdown options as: "Aggressive Barbell (Small Cap + Momentum)" for `aggressive`, "Ultra-Aggressive (70% Growth Assets)" for `ultra_aggressive`, "Balanced (Index + Liquid + Gold)" for `balanced`.
5. THE Control_Panel SHALL NOT render the gradient top stripe decoration.
6. THE Control_Panel SHALL NOT render per-field hover lift animations (`hover:-translate-y-1` on individual field containers).
7. THE Control_Panel SHALL NOT render per-field random accent colors; all field borders use `border-border` with `focus:ring-accent`.
8. THE Control_Panel SHALL NOT render the ₹10k preset button.
9. THE Control_Panel SHALL render ₹50L, ₹1 Cr, and ₹3 Cr as subtle `text-xs text-accent` quick-fill links, not styled buttons.
10. THE Control_Panel SHALL retain the SIP range slider.
11. THE Control_Panel SHALL style the Recalculate button as `bg-accent text-white rounded-md px-4 py-2 text-sm font-medium`.
12. THE Control_Panel SHALL NOT include the "Age 30 Target (April 2035)" option in the time horizon dropdown.
13. THE Control_Panel SHALL initialize the `dob` field with no personal default date.

---

### Requirement 4: Empty State / Validation Card Redesign

**User Story:** As a user, I want a clear, informative placeholder when I have not yet filled in my parameters, so that I understand what information is needed and why.

#### Acceptance Criteria

1. THE Validation_Card SHALL display a centered card with a `BarChart2` icon when the form is incomplete.
2. THE Validation_Card SHALL use the heading "Complete your profile to see projections".
3. THE Validation_Card SHALL render a plain checklist of 4 required fields, showing a grey dot for unfilled fields and a green checkmark for filled fields.
4. THE Validation_Card SHALL display the context sentence: "InvestPro calculates whether your current SIP and salary trajectory can hit your corpus target by your deadline — and tells you exactly what needs to change if not."
5. THE Validation_Card SHALL NOT render emoji characters in field labels or checklist items.
6. THE Validation_Card SHALL NOT render colored "Required" badge pills with per-field accent colors.
7. THE Validation_Card SHALL NOT render the "1-CLICK COMPLETE PRESETS" preset buttons (rocket, gem, target).

---

### Requirement 5: Wealth Projection Card Redesign

**User Story:** As a user, I want a clean wealth projection view that surfaces my on-track status and career leverage insight in readable prose, so that I can understand my financial position without interpreting internal system output.

#### Acceptance Criteria

1. THE Wealth_Projection_Card SHALL use the heading "Wealth Projection" instead of "Ghost Trajectory & Dynamic Timeline Engine".
2. WHEN the backend verdict is `ON_TRACK`, THE Wealth_Projection_Card SHALL render a plain "On Track" label without emoji, `animate-bounce`, or floating ₹ rain animation.
3. THE Wealth_Projection_Card SHALL render the backend `message` string as readable `text-sm` prose inside a clean `rounded-lg p-4` info block with theme-appropriate border colors.
4. WHEN the backend verdict is `CAREER_LEVERAGE_REQUIRED`, THE Wealth_Projection_Card SHALL surface the career leverage insight in the format: "Market returns alone cannot close this gap. To reach [target] by [date], your monthly SIP needs to be [X], which requires a CTC of approximately [Y] LPA."
5. THE Purchasing_Power_Analysis section SHALL use the heading "Purchasing Power Analysis" instead of "INTERACTIVE WEALTH EROSION DUAL LADDER & SIMULATOR".
6. THE Purchasing_Power_Analysis section SHALL retain both the gross nominal pillar and the real purchasing power pillar with inflation and LTCG tax sliders.
7. THE Purchasing_Power_Analysis section SHALL retain the `get_real_world_equivalent_note` text output.
8. THE Purchasing_Power_Analysis section SHALL replace the inner decorative animated pulse bar with a single clean segmented bar using theme token colors.
9. THE Wealth_Projection_Card chart SHALL use `#2563EB` as the stroke color with a subtle fill, and axis/tooltip colors SHALL use design token values.
10. THE Career_Roadmap table SHALL retain all existing columns, with headers styled as `text-xs text-muted uppercase`.
11. THE Career_Roadmap table SHALL NOT render per-row colored badges (e.g., "TARGET HIT" with amber background).
12. THE Wealth_Projection_Card SHALL NOT render the floating ₹ rain animation (`animate-float-up` elements).

---

### Requirement 6: Recommended Portfolio Card Redesign

**User Story:** As a user, I want a clean fund table that shows allocation buckets, risk levels, and returns in a readable format, so that I can assess my portfolio without decorative noise.

#### Acceptance Criteria

1. THE Portfolio_Card SHALL use the heading "Recommended Portfolio" instead of "Mutual Fund Performance & Goal Contribution Analysis".
2. THE Portfolio_Card SHALL display a strategy label pill at the top of the card showing the active risk strategy name.
3. THE Portfolio_Card SHALL display the fund's Bucket label (Anchor, Accelerator, Debt Shield, Hedge) as a `text-xs text-muted` tag adjacent to the fund name.
4. THE Portfolio_Card risk badges SHALL use the color convention: red for Very High or High risk, amber for Moderate-High, green for Low or Low-Moderate.
5. THE Portfolio_Card returns SHALL be displayed as plain inline `font-mono text-sm` with `text-xs text-muted` labels for 3Y, 5Y, All-Time — not inside colored badge wrappers.
6. THE Portfolio_Card Groww link SHALL be rendered as `text-accent text-xs` with an `ExternalLink` icon, inline in the row, not as a styled button.
7. THE Portfolio_Card summary row SHALL use `border-t pt-4 flex justify-between` layout showing Portfolio CAGR and Total Annual Growth.
8. THE Portfolio_Card SHALL NOT render `Sparkles` icons in any row.
9. THE Portfolio_Card SHALL NOT render the decorative gradient summary box (`bg-gradient-to-r from-emerald-500/10...`).
10. THE Portfolio_Card SHALL NOT render per-row allocation weight badge pills with cyan colored borders.

---

### Requirement 7: Risk Monitors Card — SMA Circuit Breaker Redesign

**User Story:** As a user, I want a clear SMA circuit breaker status display without crash simulation controls, so that I can see the real current market signal without being confused by a simulated state.

#### Acceptance Criteria

1. THE Risk_Monitors_Card SHALL use the heading "Risk Monitors" for the combined section.
2. THE SMA_Section SHALL display two stat tiles: one for SMA 50 and one for SMA 200, with values rendered in `font-mono`.
3. WHEN SMA 50 is above SMA 200, THE SMA_Section SHALL display a green dot and the label "Bullish — SMA 50 above SMA 200".
4. WHEN SMA 50 is below SMA 200, THE SMA_Section SHALL display a red dot and the label "Bearish — SMA 50 below SMA 200".
5. THE SMA_Section SHALL include a plain prose explanation of what the circuit breaker does.
6. THE SMA_Section SHALL include a disclaimer in `text-xs text-muted italic`: "SMA values are indicative. Computed from daily AMFI NAV data."
7. THE Risk_Monitors_Card SHALL NOT render the crash simulation toggle button.
8. THE Risk_Monitors_Card SHALL NOT render the `isCrashSimulated` state or any simulated SMA values.
9. THE Risk_Monitors_Card SHALL NOT render the `animate-alarm-flash` class or the "DEATH CROSS DETECTED!" banner.
10. THE Risk_Monitors_Card SHALL NOT render the Flame icon.

---

### Requirement 8: Risk Monitors Card — AUM Bloat Scanner Section (New)

**User Story:** As a user, I want to see the AUM bloat status for accelerator funds in the UI, so that I can identify when a fund has grown too large to remain agile.

#### Acceptance Criteria

1. THE AUM_Section SHALL be rendered below the SMA Circuit Breaker section, separated by a `border-t`.
2. THE AUM_Section SHALL use the heading "AUM Bloat Monitor".
3. THE AUM_Section SHALL display each tracked accelerator fund with a status pill: green for HEALTHY, amber for WARNING, red for BLOATED.
4. THE AUM_Section SHALL display the threshold note: "Small-cap and momentum funds lose agility above ₹10,000 Crore AUM."
5. THE AUM_Section SHALL include a disclaimer in `text-xs text-muted italic`: "AUM data updated via daily pipeline."
6. WHEN the API returns no AUM data, THE AUM_Section SHALL display a `text-sm text-muted` placeholder.

---

### Requirement 9: Execution Directives Feed Redesign

**User Story:** As a user, I want to see my fund directives derived dynamically from my current portfolio allocation, so that the directives always reflect my actual chosen strategy rather than hardcoded examples.

#### Acceptance Criteria

1. THE Directives_Feed SHALL use the heading "Execution Directives".
2. THE Directives_Feed SHALL accept `fundUniverse` as a prop from `App.jsx`.
3. THE Directives_Feed SHALL derive directive rows from `fundUniverse.asset_breakdown`, displaying one row per fund.
4. EACH directive row SHALL display a BUY badge in green, the fund name, the `allocated_sip` value in `font-mono`, and an inline Groww link.
5. THE Directives_Feed SHALL display the placeholder note: "PAUSE SIP directives appear here when the circuit breaker triggers a momentum breakdown."
6. THE Directives_Feed rows SHALL use `divide-y divide-border` layout without nested card containers.
7. THE Directives_Feed Telegram button SHALL be rendered as `text-xs text-muted underline`, not a primary button.
8. WHEN `fundUniverse` is null, THE Directives_Feed SHALL display a `text-sm text-muted` placeholder string.

---

### Requirement 10: App Layout, Theme Sync, and Loading State

**User Story:** As a user, I want the application layout to load smoothly with appropriate skeleton states and consistent theme behavior, so that my experience feels polished and professional.

#### Acceptance Criteria

1. THE App SHALL read the initial theme from `localStorage` on mount and apply it without a flash.
2. WHEN the user toggles the theme, THE App SHALL update React state, `localStorage`, and `document.documentElement` class in a single event handler.
3. WHEN data is loading and no prior data exists, THE App SHALL render 3 skeleton blocks using `rounded-lg bg-surface-raised animate-pulse` at approximate heights of 400px, 300px, and 200px.
4. THE App SHALL pass `fundUniverse` as a prop to the `Directives_Feed` component.
5. THE App SHALL NOT apply `hover:-translate-y-1` lift animation to any card containers.
6. THE App SHALL retain the `max-w-7xl`, `py-8`, `gap-6`, and 12-column grid layout.
7. THE App SHALL initialize `params.dob` with no personal default date value.
8. THE App SHALL NOT include `far_target_date: "2035-04-14"` as a hardcoded default in the initial params state.

---

### Requirement 11: Global Copy and Accessibility Polish

**User Story:** As a user, I want all copy to use professional fintech language and all interactive elements to be accessible, so that the product feels credible and is usable with keyboard navigation.

#### Acceptance Criteria

1. THE Application SHALL use `font-mono` (JetBrains Mono) exclusively for numeric values and use Outfit for all labels, headings, and prose.
2. THE Application SHALL apply `focus-visible:ring-2 ring-accent` to all interactive elements (buttons, inputs, selects, links).
3. THE Application SHALL include a `htmlFor` attribute on all `<label>` elements, matching the `id` of the associated input.
4. THE Application SHALL set the `<title>` of `index.html` to "InvestPro — Investment Planner".
5. THE Application SHALL NOT link to `vite.svg` as the favicon; the `<link rel="icon">` tag SHALL be updated or removed.
6. THE Application SHALL NOT include the strings "DSS", "Command Center", "Casino Exit", "PAISA UDDE", "Ghost Trajectory Engine", "Wealth Command Center", or "DSS V6.0" anywhere in rendered UI text or visible copy.
