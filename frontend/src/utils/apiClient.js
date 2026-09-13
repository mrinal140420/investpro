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
 * Instant Deterministic Client-Side Computational Engine
 * Guarantees 0ms latency, 60fps slider responsiveness, and zero console network errors.
 */
export async function apiFetchTrajectory(params) {
  return calculateTrajectoryAnalysis(params);
}

export async function apiFetchFundUniverse(monthlySip, lumpSum, riskMode) {
  return getEnrichedFundUniverse(monthlySip, lumpSum, riskMode);
}

export async function apiFetchGoalPlan(payload) {
  return calculateGoalPlan(payload);
}

export async function apiFetchTaxHarvesting(portfolioValue) {
  return scanTaxHarvesting({ portfolio_value: portfolioValue });
}

export async function apiFetchMilestones(currentCorpus, annualCtcLpa) {
  return calculateMilestones({ current_corpus: currentCorpus, annual_ctc_lpa: annualCtcLpa });
}

