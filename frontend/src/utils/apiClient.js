import {
  calculateGoalPlan,
  scanTaxHarvesting,
  calculateMilestones,
  getEnrichedFundUniverse,
} from './financialCalculations';
import { format_indian_currency } from './formatters';

// Circuit breaker state to prevent spamming failing remote backend endpoints
let isBackendAvailable = true;
let lastFailureTimestamp = 0;
const RETRY_INTERVAL_MS = 60000; // Check remote backend at most once every 60 seconds if it fails

export function isBackendOnline() {
  if (!isBackendAvailable && Date.now() - lastFailureTimestamp > RETRY_INTERVAL_MS) {
    // Reset circuit breaker after retry interval to test remote recovery
    isBackendAvailable = true;
  }
  return isBackendAvailable;
}

export function markBackendOffline() {
  isBackendAvailable = false;
  lastFailureTimestamp = Date.now();
}

export function resetBackendStatus() {
  isBackendAvailable = true;
  lastFailureTimestamp = 0;
}

/**
 * High-precision Client-side Trajectory Calculation
 */
export function calculateTrajectoryAnalysis(currentParams) {
  const sip = currentParams.monthly_investable_sip || 25000;
  const lump = currentParams.lump_sum_amount || 0;
  const ctc = currentParams.current_ctc_lpa || 12;
  const stepUp = currentParams.annual_step_up_pct ?? 0.10;
  const target = currentParams.near_target_amount || 5000000;
  const targetDate = new Date(currentParams.near_target_date || '2028-12-31');
  const today = new Date();
  const months = Math.max(1, Math.round((targetDate - today) / (1000 * 60 * 60 * 24 * 30.4375)));
  const r_m = Math.pow(1 + 0.15, 1 / 12) - 1;

  let corpus = lump;
  let curSip = sip;
  let totalContrib = lump;
  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m % 12 === 1)) curSip *= (1 + stepUp);
    corpus = (corpus + curSip) * (1 + r_m);
    totalContrib += curSip;
  }

  const capitalGains = Math.max(0, corpus - totalContrib);
  const taxableGains = Math.max(0, capitalGains - 125000);
  const ltcgTax = taxableGains * 0.125;
  const postTax = corpus - ltcgTax;
  const yearsRem = Math.round((months / 12) * 10) / 10;
  const realPower = postTax / Math.pow(1.06, yearsRem);

  // Career Roadmap Generation
  const roadmap = [];
  let rCorpus = lump;
  let rSip = sip;
  const startYr = new Date().getFullYear();
  for (let yr = 0; yr <= 9; yr++) {
    for (let m = 1; m <= 12; m++) {
      rCorpus = (rCorpus + rSip) * (1 + r_m);
    }
    roadmap.push({
      year: startYr + yr,
      role: yr === 0 ? 'Senior Software Engineer' : yr <= 2 ? 'Lead Architect / Staff' : yr <= 5 ? 'Principal / VP Wealth Milestone' : 'Director / Executive',
      suggested_ctc_lpa: Math.round(ctc * Math.pow(1.12, yr) * 10) / 10,
      formatted_ctc: `₹${(Math.round(ctc * Math.pow(1.12, yr) * 10) / 10).toFixed(1)} LPA`,
      monthly_sip: Math.round(rSip),
      formatted_sip: `₹${Math.round(rSip).toLocaleString('en-IN')}`,
      projected_corpus_eoy: Math.round(rCorpus),
      formatted_corpus: rCorpus >= 10000000 ? `₹${(rCorpus / 10000000).toFixed(2)} Cr` : `₹${(rCorpus / 100000).toFixed(2)} Lakhs`,
    });
    rSip *= (1 + stepUp);
  }

  return {
    user_profile: {
      monthly_sip: sip,
      lump_sum: lump,
      target_amount: target,
      target_date: currentParams.near_target_date,
      annual_step_up_pct: stepUp,
    },
    short_term_target: {
      months_remaining: months,
      years_remaining: yearsRem,
      total_contributions: totalContrib,
      formatted_contributions: totalContrib >= 10000000 ? `₹${(totalContrib / 10000000).toFixed(2)} Cr` : `₹${(totalContrib / 100000).toFixed(2)} Lakhs`,
      target_amount: target,
      formatted_target: target >= 10000000 ? `₹${(target / 10000000).toFixed(2)} Cr` : `₹${(target / 100000).toFixed(2)} Lakhs`,
      projected_short_fv: corpus,
      formatted_projected: corpus >= 10000000 ? `₹${(corpus / 10000000).toFixed(2)} Cr` : `₹${(corpus / 100000).toFixed(2)} Lakhs`,
      ltcg_tax: ltcgTax,
      formatted_tax: `₹${Math.round(ltcgTax).toLocaleString('en-IN')}`,
      post_tax_corpus: postTax,
      formatted_post_tax: postTax >= 10000000 ? `₹${(postTax / 10000000).toFixed(2)} Cr` : `₹${(postTax / 100000).toFixed(2)} Lakhs`,
      real_purchasing_power_today: realPower,
      formatted_real_power: realPower >= 10000000 ? `₹${(realPower / 10000000).toFixed(2)} Cr` : `₹${(realPower / 100000).toFixed(2)} Lakhs`,
      verdict: corpus >= target ? 'ON_TRACK' : (months < 36 && target >= 5000000 && corpus < target * 0.4 ? 'UNREALISTIC_TIMELINE' : 'NEEDS_ADJUSTMENT'),
      safe_alternative_years: Math.round(Math.max(yearsRem, Math.log(target / (lump || sip * 12)) / Math.log(1.14))),
      formatted_needed_sip: `₹${Math.round(target / months).toLocaleString('en-IN')}`,
      formatted_needed_ctc: `₹${Math.round(((target / months) / 0.3 / 0.85) * 12 / 100000)} LPA`,
      message: corpus >= target
        ? `ON TRACK! At ₹${sip.toLocaleString('en-IN')}/mo SIP (+ ${Math.round(stepUp * 100)}% annual step-up), you will comfortably achieve ₹${(target / 100000).toFixed(1)} Lakhs by ${targetDate.getFullYear()}!`
        : `REALITY CHECK ALERT: Reaching ₹${(target / 100000).toFixed(1)} Lakhs in only ${months} months is mathematically impossible without speculative gambling. Your current plan safely accumulates ₹${(corpus / 100000).toFixed(2)} Lakhs.`,
    },
    career_roadmap_to_3cr: roadmap,
  };
}

/**
 * Resilient API Call Wrapper with Instant Deterministic Fallback
 */
export async function apiFetchTrajectory(params) {
  if (!isBackendOnline()) {
    return calculateTrajectoryAnalysis(params);
  }

  try {
    const res = await fetch('/api/v1/user/trajectory-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      return await res.json();
    } else {
      markBackendOffline();
      return calculateTrajectoryAnalysis(params);
    }
  } catch (err) {
    markBackendOffline();
    return calculateTrajectoryAnalysis(params);
  }
}

export async function apiFetchFundUniverse(monthlySip, lumpSum, riskMode) {
  if (!isBackendOnline()) {
    return getEnrichedFundUniverse(monthlySip, lumpSum, riskMode);
  }

  try {
    const res = await fetch(
      `/api/v1/funds/barbell-universe?monthly_sip=${monthlySip}&lump_sum=${lumpSum}&risk_mode=${riskMode}`,
      { method: 'POST' }
    );

    if (res.ok) {
      return await res.json();
    } else {
      markBackendOffline();
      return getEnrichedFundUniverse(monthlySip, lumpSum, riskMode);
    }
  } catch (err) {
    markBackendOffline();
    return getEnrichedFundUniverse(monthlySip, lumpSum, riskMode);
  }
}

export async function apiFetchGoalPlan(payload) {
  if (!isBackendOnline()) {
    return calculateGoalPlan(payload);
  }

  try {
    const res = await fetch('/api/v1/goals/reverse-emi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    } else {
      markBackendOffline();
      return calculateGoalPlan(payload);
    }
  } catch (err) {
    markBackendOffline();
    return calculateGoalPlan(payload);
  }
}

export async function apiFetchTaxHarvesting(portfolioValue) {
  if (!isBackendOnline()) {
    return scanTaxHarvesting({ portfolio_value: portfolioValue });
  }

  try {
    const res = await fetch('/api/v1/tax/harvesting-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_value: portfolioValue }),
    });

    if (res.ok) {
      return await res.json();
    } else {
      markBackendOffline();
      return scanTaxHarvesting({ portfolio_value: portfolioValue });
    }
  } catch (err) {
    markBackendOffline();
    return scanTaxHarvesting({ portfolio_value: portfolioValue });
  }
}

export async function apiFetchMilestones(currentCorpus, annualCtcLpa) {
  if (!isBackendOnline()) {
    return calculateMilestones({ current_corpus: currentCorpus, annual_ctc_lpa: annualCtcLpa });
  }

  try {
    const res = await fetch('/api/v1/milestones/freedom-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_corpus: currentCorpus,
        annual_ctc_lpa: annualCtcLpa,
      }),
    });

    if (res.ok) {
      return await res.json();
    } else {
      markBackendOffline();
      return calculateMilestones({ current_corpus: currentCorpus, annual_ctc_lpa: annualCtcLpa });
    }
  } catch (err) {
    markBackendOffline();
    return calculateMilestones({ current_corpus: currentCorpus, annual_ctc_lpa: annualCtcLpa });
  }
}
