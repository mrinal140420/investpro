import {
  calculateGoalPlan,
  scanTaxHarvesting,
  calculateMilestones,
  getEnrichedFundUniverse,
  calculateTrajectoryAnalysis,
} from './financialCalculations.js';
import { format_indian_currency } from './formatters.js';

export {
  calculateTrajectoryAnalysis,
  calculateGoalPlan,
  scanTaxHarvesting,
  calculateMilestones,
  getEnrichedFundUniverse,
};

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
