/**
 * InvestPro — Cashflow, Envelope Budgeting, SurplusSweep™ & Windfall STP Engine
 * Pure deterministic client-side engine tailored to Indian Rupee (₹) cash flows.
 */

import { format_indian_currency } from './formatters.js';

export const STORAGE_KEY_CASHFLOW = 'investpro_cashflow_data';

export const DEFAULT_ENVELOPES = [
  {
    id: 'env_rent_emi',
    name: 'Rent & Home EMI',
    category: 'Fixed Obligation',
    icon: 'Home',
    budgeted: 25000,
    spent: 25000,
    color: '#6366f1' // Indigo
  },
  {
    id: 'env_groceries',
    name: 'Groceries & Essentials',
    category: 'Living Essentials',
    icon: 'ShoppingBag',
    budgeted: 12000,
    spent: 8500,
    color: '#10b981' // Emerald
  },
  {
    id: 'env_dining',
    name: 'Dining & Outing',
    category: 'Discretionary',
    icon: 'Utensils',
    budgeted: 8000,
    spent: 5400,
    color: '#f59e0b' // Amber
  },
  {
    id: 'env_utilities',
    name: 'Bills & Utilities (WiFi, Power)',
    category: 'Fixed Obligation',
    icon: 'Zap',
    budgeted: 5000,
    spent: 4200,
    color: '#06b6d4' // Cyan
  },
  {
    id: 'env_lifestyle',
    name: 'Shopping & Leisure',
    category: 'Discretionary',
    icon: 'Sparkles',
    budgeted: 6000,
    spent: 3800,
    color: '#ec4899' // Pink
  },
  {
    id: 'env_buffer',
    name: 'Emergency Float / Buffer',
    category: 'Safety Net',
    icon: 'Shield',
    budgeted: 4000,
    spent: 500,
    color: '#8b5cf6' // Violet
  }
];

export const MERCHANT_CATEGORY_MAP = [
  { keywords: ['zomato', 'swiggy', 'mcdonalds', 'starbucks', 'dominos', 'cafe', 'restaurant', 'bar', 'dine'], envId: 'env_dining', label: 'Dining & Outing' },
  { keywords: ['blinkit', 'zepto', 'instamart', 'bigbasket', 'dmart', 'nature basket', 'supermarket', 'grocery'], envId: 'env_groceries', label: 'Groceries & Essentials' },
  { keywords: ['bescom', 'tneb', 'airtel', 'jio', 'broadband', 'act fibernet', 'electric', 'gas', 'water bill'], envId: 'env_utilities', label: 'Bills & Utilities' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'nykaa', 'ajio', 'shopping', 'retail'], envId: 'env_lifestyle', label: 'Shopping & Leisure' },
  { keywords: ['rent', 'landlord', 'nobroker', 'emi', 'hdfc bank emi', 'icici home loan'], envId: 'env_rent_emi', label: 'Rent & Home EMI' },
];

/**
 * Calculates current pay-cycle timeline based on user's payday.
 * @param {number} paydayDayOfMonth e.g. 25 for 25th of every month
 */
export function calculatePayCycleInfo(paydayDayOfMonth = 25) {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let nextPaydayDate;
  let lastPaydayDate;

  if (currentDay >= paydayDayOfMonth) {
    // Current cycle started on paydayDayOfMonth of this month
    lastPaydayDate = new Date(currentYear, currentMonth, paydayDayOfMonth);
    // Next payday is next month
    nextPaydayDate = new Date(currentYear, currentMonth + 1, paydayDayOfMonth);
  } else {
    // Current cycle started last month
    lastPaydayDate = new Date(currentYear, currentMonth - 1, paydayDayOfMonth);
    // Next payday is this month
    nextPaydayDate = new Date(currentYear, currentMonth, paydayDayOfMonth);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalCycleDays = Math.max(1, Math.round((nextPaydayDate - lastPaydayDate) / msPerDay));
  const daysElapsed = Math.max(0, Math.round((now - lastPaydayDate) / msPerDay));
  const daysRemaining = Math.max(0, Math.round((nextPaydayDate - now) / msPerDay));
  const progressPct = Math.min(100, Math.round((daysElapsed / totalCycleDays) * 100));

  return {
    payday_day: paydayDayOfMonth,
    last_payday: lastPaydayDate.toISOString().split('T')[0],
    next_payday: nextPaydayDate.toISOString().split('T')[0],
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    total_cycle_days: totalCycleDays,
    progress_pct: progressPct,
    is_eve_of_payday: daysRemaining <= 1
  };
}

/**
 * Parses UPI SMS or Receipt Text to extract transaction amount and merchant
 * @param {string} text 
 */
export function parseReceiptOrUpiText(text) {
  if (!text || typeof text !== 'string') {
    return { amount: 0, merchant: 'Unknown Merchant', suggestedEnvId: 'env_dining' };
  }

  const clean = text.toLowerCase();
  
  // Extract amount: matches "rs 450", "rs. 450.00", "inr 1,200", "spent inr 650", "debited by 540"
  let amount = 0;
  const amtMatch = text.match(/(?:rs\.?|inr|debited\s*(?:by|for)?|paid)\s*[:\s]*([\d,]+\.?\d*)/i) ||
                   text.match(/([\d,]+\.?\d*)\s*(?:rs|inr)/i) ||
                   text.match(/total\s*[:\s]*([\d,]+\.?\d*)/i);
  
  if (amtMatch) {
    const rawNum = amtMatch[1].replace(/,/g, '');
    amount = parseFloat(rawNum) || 0;
  }

  // Detect merchant
  let merchant = 'General Expense';
  let suggestedEnvId = 'env_dining';

  for (const m of MERCHANT_CATEGORY_MAP) {
    for (const kw of m.keywords) {
      if (clean.includes(kw)) {
        merchant = kw.charAt(0).toUpperCase() + kw.slice(1);
        suggestedEnvId = m.envId;
        break;
      }
    }
  }

  return {
    amount,
    merchant,
    suggestedEnvId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculates total unspent surplus ready to be swept into Barbell investments.
 */
export function calculateSurplusSweep(envelopes = DEFAULT_ENVELOPES) {
  let totalBudgeted = 0;
  let totalSpent = 0;
  let totalSurplus = 0;

  const envelopeBreakdown = envelopes.map(env => {
    totalBudgeted += env.budgeted;
    totalSpent += env.spent;
    const remaining = Math.max(0, env.budgeted - env.spent);
    totalSurplus += remaining;

    return {
      id: env.id,
      name: env.name,
      budgeted: env.budgeted,
      spent: env.spent,
      remaining,
      spent_pct: Math.round((env.spent / env.budgeted) * 100),
      is_exhausted: env.spent >= env.budgeted
    };
  });

  // Calculate Barbell deployment split for surplus
  // 50% Anchor (Nifty 50), 30% Accelerator (Small Cap Alpha), 10% Gold/Silver, 10% Liquid Buffer
  const barbellAllocation = [
    { name: 'Nifty 50 Core Index', weight_pct: 50, amount: Math.round(totalSurplus * 0.50), color: '#3b82f6' },
    { name: 'Small-Cap High-Alpha', weight_pct: 30, amount: Math.round(totalSurplus * 0.30), color: '#10b981' },
    { name: 'Silver / Gold ETF Hedge', weight_pct: 10, amount: Math.round(totalSurplus * 0.10), color: '#d4af37' },
    { name: 'Liquid T-Bill Reserve', weight_pct: 10, amount: Math.round(totalSurplus * 0.10), color: '#6366f1' },
  ];

  return {
    total_budgeted: totalBudgeted,
    total_spent: totalSpent,
    total_surplus: totalSurplus,
    formatted_surplus: format_indian_currency(totalSurplus),
    envelope_breakdown: envelopeBreakdown,
    barbell_allocation: barbellAllocation,
    can_sweep: totalSurplus > 500
  };
}

/**
 * Windfall STP (Systematic Transfer Plan) Recommendation Engine
 * Analyzes large lump sum deposits (bonuses, tax refunds > 3x monthly income)
 * and structures a mathematically optimal Liquid-to-Equity STP.
 * 
 * @param {number} windfallAmount e.g. 500000 (₹5,00,000)
 * @param {number} monthlySalary e.g. 65000 (₹65,000)
 * @param {number} stpMonths e.g. 10 months
 * @param {number} liquidYtmPct e.g. 7.0% per annum
 */
export function calculateWindfallSTP(
  windfallAmount = 500000,
  monthlySalary = 65000,
  stpMonths = 10,
  liquidYtmPct = 7.0
) {
  const isAnomalyWindfall = windfallAmount >= monthlySalary * 2.5;
  const months = Math.max(3, Math.min(24, stpMonths));
  const monthlyTransfer = Math.round(windfallAmount / months);

  // Compute interest earned in liquid fund during drip-feed tenure
  // Using declining balance compound interest model
  let remainingLiquid = windfallAmount;
  let totalLiquidInterestEarned = 0;
  const monthlyLiquidRate = (liquidYtmPct / 100) / 12;

  const schedule = [];

  for (let m = 1; m <= months; m++) {
    // Interest earned on current balance this month
    const interestThisMonth = remainingLiquid * monthlyLiquidRate;
    totalLiquidInterestEarned += interestThisMonth;

    // Monthly transfer to equities
    const transferAmount = Math.min(remainingLiquid, monthlyTransfer);
    remainingLiquid = Math.max(0, remainingLiquid - transferAmount + interestThisMonth);

    schedule.push({
      month: m,
      transfer_amount: transferAmount,
      formatted_transfer: format_indian_currency(transferAmount),
      interest_earned: Math.round(interestThisMonth),
      remaining_liquid: Math.round(remainingLiquid),
      equity_deployed_cumulative: transferAmount * m,
      formatted_equity_cumulative: format_indian_currency(transferAmount * m)
    });
  }

  // Drawdown mitigation metric (risk avoided vs immediate all-in peak lump sum)
  const volatilityReductionPct = Math.round((1 - (1 / Math.sqrt(months))) * 100);

  return {
    windfall_amount: windfallAmount,
    formatted_windfall: format_indian_currency(windfallAmount),
    is_anomaly_windfall: isAnomalyWindfall,
    monthly_salary: monthlySalary,
    stp_tenure_months: months,
    monthly_transfer_amount: monthlyTransfer,
    formatted_monthly_transfer: format_indian_currency(monthlyTransfer),
    liquid_ytm_pct: liquidYtmPct,
    total_liquid_interest_earned: Math.round(totalLiquidInterestEarned),
    formatted_interest_earned: format_indian_currency(Math.round(totalLiquidInterestEarned)),
    volatility_reduction_pct: volatilityReductionPct,
    schedule: schedule,
    target_funds: [
      { name: 'Nifty 50 Index Direct Growth', share_pct: 50, monthly_drip: Math.round(monthlyTransfer * 0.50) },
      { name: 'Tata Small Cap Fund Direct Growth', share_pct: 30, monthly_drip: Math.round(monthlyTransfer * 0.30) },
      { name: 'Motilal Oswal S&P 500 Index Fund', share_pct: 10, monthly_drip: Math.round(monthlyTransfer * 0.10) },
      { name: 'Nippon India Silver ETF FoF', share_pct: 10, monthly_drip: Math.round(monthlyTransfer * 0.10) },
    ]
  };
}

/**
 * Storage Helpers
 */
export function getSavedCashflowData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASHFLOW);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse cashflow storage:', e);
    return null;
  }
}

export function saveCashflowData(data) {
  try {
    localStorage.setItem(STORAGE_KEY_CASHFLOW, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save cashflow storage:', e);
  }
}
