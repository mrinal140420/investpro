/**
 * InvestPro — Official MFCentral & CAS Statement Client-Side Parser
 * Zero external paid APIs. 100% in-browser deterministic parsing & normalization.
 * Handles official CAMS & KFintech Detailed CAS exports from MFCentral.
 */

import { format_indian_currency } from './formatters.js';

export const STORAGE_KEY_MFCENTRAL = 'investpro_mfcentral_session';

// Taxonomy rules to classify Indian Mutual Funds into InvestPro Barbell Buckets
const ASSET_CLASS_RULES = [
  { regex: /(s&p\s*500|nasdaq|us\s*equity|global|international|world|overseas|greater\s*china|euro|emerging\s*markets)/i, bucket: 'Global Anchor', category: 'Global Equity' },
  { regex: /(gold|silver|sovereign\s*gold|sgb|precious)/i, bucket: 'Hedge', category: 'Precious Metals / Gold' },
  { regex: /(liquid|overnight|money\s*market|arbitrage|debt|gilt|treasury|short\s*duration|banking\s*&\s*psu|corporate\s*bond|savings\s*fund|ultra\s*short|low\s*duration)/i, bucket: 'Debt Shield', category: 'Liquid & Arbitrage' },
  { regex: /(small\s*cap|smallcap|micro\s*cap|nifty\s*smallcap)/i, bucket: 'Accelerator', category: 'Small Cap Alpha' },
  { regex: /(mid\s*cap|midcap|nifty\s*midcap|emerging\s*equities)/i, bucket: 'Accelerator', category: 'Mid Cap Growth' },
  { regex: /(large\s*cap|largecap|bluechip|top\s*100|nifty\s*50|sensex|index\s*fund|flexi\s*cap|multi\s*cap|focused|contra|elss|tax\s*saver|value\s*fund)/i, bucket: 'Anchor', category: 'Core Equity' },
];

/**
 * Detects if a scheme is a Regular (distributor commission loaded) plan.
 */
export function isRegularPlan(schemeName = '') {
  const upper = schemeName.toUpperCase();
  if (upper.includes('REGULAR')) return true;
  if (!upper.includes('DIRECT') && (upper.includes('GROWTH') || upper.includes('DIVIDEND') || upper.includes('IDCW'))) {
    return true;
  }
  return false;
}

/**
 * Categorizes a mutual fund scheme into InvestPro factor bucket.
 */
export function classifySchemeBucket(schemeName = '') {
  for (const rule of ASSET_CLASS_RULES) {
    if (rule.regex.test(schemeName)) {
      return { bucket: rule.bucket, category: rule.category };
    }
  }
  return { bucket: 'Anchor', category: 'Core Equity' };
}

/**
 * Detects the RTA from scheme or folio patterns.
 */
export function detectRTA(schemeName = '', folio = '') {
  const upper = (schemeName + ' ' + folio).toUpperCase();
  if (upper.includes('KFIN') || upper.includes('MOTILAL') || upper.includes('NIPPON') || upper.includes('AXIS') || upper.includes('MIRAE') || upper.includes('UTI') || upper.includes('QUANT')) {
    return 'KFintech';
  }
  return 'CAMS';
}

/**
 * Cleans string numbers into valid floats.
 */
function parseNum(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/\(/g, '-').replace(/\)/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses raw text copied or extracted from an MFCentral / CAMS / KFintech statement.
 */
export function parseMFCentralText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('No statement content provided for parsing.');
  }

  const folios = [];

  // Regex 1: Match Closing Unit Balance line (Standard across all MFCentral Detailed CAS reports)
  // E.g. "Closing Unit Balance: 1.609 Nav as on 11-SEP-2026: INR 61.0345 Valuation on 14-Sep-2026 : INR 98.20"
  const closingRegex = /Closing\s*Unit\s*Balance[:\s]+([\d,]+\.?\d*)\s+Nav\s*as\s*on\s*[^:]+:\s*(?:INR\s*)?([\d,]+\.?\d*)\s+Valuation\s*on\s*[^:]+:\s*(?:INR\s*)?([\d,]+\.?\d*)/gi;

  // Regex 2: Match Folio No
  const folioRegex = /FOLIO\s*(?:NO|Number)?[:\s]+([0-9\/\-]+)/gi;

  // Regex 3: Match ISIN
  const isinRegex = /ISIN[:\s]+(INF[A-Z0-9]{9})/gi;

  // Regex 4: Match Transaction Lines
  // E.g. "04-SEP-2026 Purchase (Continuous Offer) 100.00 1.609 62.14 1.609"
  const txRegex = /(\d{2}[-\/][A-Za-z0-9]{3,}[-\/]\d{2,4})\s+([A-Za-z\s\-\/\.\(\)]+?)\s+([\(\-]?[\d,]+\.?\d*[\)]?)\s+([\(\-]?[\d,]+\.?\d*[\)]?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/g;

  // Segment statement by folio / scheme blocks
  // In MFCentral, each scheme has a section ending with "Closing Unit Balance: ..."
  let closingMatch;
  let lastIndex = 0;

  while ((closingMatch = closingRegex.exec(rawText)) !== null) {
    const blockText = rawText.substring(lastIndex, closingMatch.index + closingMatch[0].length);
    lastIndex = closingMatch.index + closingMatch[0].length;

    const closingUnits = parseNum(closingMatch[1]);
    const closingNav = parseNum(closingMatch[2]);
    const closingValuation = parseNum(closingMatch[3]);

    // Extract Folio
    const fM = blockText.match(/FOLIO\s*(?:NO|Number)?[:\s]+([0-9\/\-]+)/i);
    const folioNo = fM ? fM[1].trim() : `FOLIO-${folios.length + 1}`;

    // Extract ISIN
    const isinM = blockText.match(/ISIN[:\s]+(INF[A-Z0-9]{9})/i);
    const isin = isinM ? isinM[1].toUpperCase() : null;

    // Extract Scheme Name
    let schemeName = 'Indian Mutual Fund';
    const schemeM = blockText.match(/(?:FOLIO NO:[^\n]+\n)?([A-Za-z0-9\s\-]+(?:Fund|Plan|Growth|Index|ETF)[A-Za-z0-9\s\-]*)\s*(?:\(Advisor|$)/i);
    if (schemeM) {
      schemeName = schemeM[1].replace(/FOLIO\s*NO:[^\n]+/i, '').replace(/===.*?===/g, '').trim();
    } else {
      // Fallback line-by-line scheme candidate
      const lines = blockText.split('\n').map(l => l.trim());
      const cand = lines.find(l => 
        (l.includes('Fund') || l.includes('Plan') || l.includes('Growth') || l.includes('Direct')) &&
        !l.includes('Consolidated') && !l.includes('Statement') && l.length > 8
      );
      if (cand) schemeName = cand.replace(/\s*-\s*ISIN:.*$/i, '').trim();
    }

    // Extract Transactions in this block
    let txM;
    let netInvested = 0;
    let hasSip = false;
    let sipAmount = 0;
    let txCount = 0;

    while ((txM = txRegex.exec(blockText)) !== null) {
      txCount++;
      const desc = txM[2].trim().toUpperCase();
      const amt = parseNum(txM[3]);
      const isRedemption = desc.includes('REDEMPT') || desc.includes('SALE') || desc.includes('SWITCH OUT');
      const isSip = desc.includes('SIP') || desc.includes('SYSTEMATIC');

      if (!isRedemption) {
        netInvested += amt;
        if (isSip) {
          hasSip = true;
          sipAmount = amt;
        }
      } else {
        netInvested = Math.max(0, netInvested - amt);
      }
    }

    if (netInvested === 0 && closingValuation > 0) {
      netInvested = closingValuation;
    }

    const curVal = closingValuation > 0 ? closingValuation : Math.round(closingUnits * closingNav * 100) / 100;
    const pnl = Math.round((curVal - netInvested) * 100) / 100;
    const pnlPct = netInvested > 0 ? Math.round(((curVal - netInvested) / netInvested) * 1000) / 10 : 0;

    const isReg = isRegularPlan(schemeName);
    const { bucket, category } = classifySchemeBucket(schemeName);
    const rta = detectRTA(schemeName, folioNo);

    folios.push({
      id: `mf-${folios.length + 1}`,
      folio_number: folioNo,
      scheme_name: schemeName,
      isin: isin,
      units: closingUnits,
      nav: closingNav,
      current_value: curVal,
      invested_amount: netInvested,
      unrealized_pnl: pnl,
      unrealized_pnl_pct: pnlPct,
      is_regular_plan: isReg,
      bucket,
      category,
      rta,
      sip_active: hasSip,
      monthly_sip_amount: sipAmount,
      transaction_count: txCount,
      holding_mode: 'DIRECT_MFCENTRAL_CAS'
    });
  }

  // Fallback 1: If standard Closing Unit Balance format not found, parse line by line
  if (folios.length === 0) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let currentFolio = null;
    let currentScheme = null;
    let currentIsin = null;
    let currentUnits = 0;
    let currentNav = 0;
    let currentVal = 0;
    let currentCost = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const fMatch = line.match(/FOLIO\s*(?:NO|Number)?[:\s]+([0-9\/\-]+)/i);
      if (fMatch) currentFolio = fMatch[1].trim();

      const isinMatch = line.match(/(INF[A-Z0-9]{9})/i);
      if (isinMatch) currentIsin = isinMatch[1].toUpperCase();

      if (
        (line.includes('Fund') || line.includes('Plan') || line.includes('Growth') || line.includes('Direct')) &&
        line.length > 10 &&
        !/^\d{2}[-\/]/.test(line) &&
        !line.toLowerCase().includes('consolidated')
      ) {
        currentScheme = line.replace(/\s*-\s*ISIN:.*$/i, '').replace(/===.*?===/g, '').trim();
      }

      // Check numbers in line
      const nums = (line.match(/[\d,]+\.\d+/g) || []).map(parseNum);
      if (nums.length >= 3 && currentScheme) {
        currentCost = nums[0];
        currentUnits = nums[1];
        currentNav = nums[2];
        currentVal = nums.length >= 4 ? nums[3] : Math.round(currentUnits * currentNav * 100) / 100;
      }
    }

    if (currentScheme && (currentUnits > 0 || currentVal > 0)) {
      const isReg = isRegularPlan(currentScheme);
      const { bucket, category } = classifySchemeBucket(currentScheme);
      const rta = detectRTA(currentScheme, currentFolio || '');

      folios.push({
        id: `mf-${folios.length + 1}`,
        folio_number: currentFolio || 'FOLIO-1',
        scheme_name: currentScheme,
        isin: currentIsin,
        units: currentUnits,
        nav: currentNav,
        current_value: currentVal,
        invested_amount: currentCost > 0 ? currentCost : currentVal,
        unrealized_pnl: Math.round((currentVal - (currentCost > 0 ? currentCost : currentVal)) * 100) / 100,
        unrealized_pnl_pct: currentCost > 0 ? Math.round(((currentVal - currentCost) / currentCost) * 1000) / 10 : 0,
        is_regular_plan: isReg,
        bucket,
        category,
        rta,
        sip_active: false,
        monthly_sip_amount: 0,
      });
    }
  }

  if (folios.length === 0) {
    throw new Error(
      'Could not detect valid mutual fund holding records in this statement. ' +
      'Please verify that your statement contains folio and unit balance records.'
    );
  }

  return normalizeMFCentralPayload(folios);
}

/**
 * Assembles the verified MFCentral portfolio session payload with exact currency formatting.
 */
export function normalizeMFCentralPayload(folios) {
  let totalInvested = 0;
  let totalCurrentValuation = 0;
  let totalPnl = 0;
  let activeMonthlySip = 0;
  let regularPlanCount = 0;
  let directPlanCount = 0;

  const enrichedHoldings = folios.map((item, idx) => {
    totalInvested += item.invested_amount;
    totalCurrentValuation += item.current_value;
    totalPnl += item.unrealized_pnl;
    activeMonthlySip += (item.monthly_sip_amount || 0);

    if (item.is_regular_plan) {
      regularPlanCount++;
    } else {
      directPlanCount++;
    }

    const fmtVal = item.current_value < 1000 
      ? `₹${item.current_value.toFixed(2)}` 
      : format_indian_currency(Math.round(item.current_value));

    const fmtPnl = item.unrealized_pnl >= 0 
      ? `+₹${Math.abs(item.unrealized_pnl).toFixed(2)}` 
      : `-₹${Math.abs(item.unrealized_pnl).toFixed(2)}`;

    return {
      ...item,
      id: item.id || `mf-${idx + 1}`,
      formatted_value: fmtVal,
      formatted_pnl: fmtPnl,
    };
  });

  const overallPnlPct = totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 1000) / 10 : 0;
  const directPurityPct = folios.length > 0 ? Math.round((directPlanCount / folios.length) * 100) : 100;

  const fmtTotalVal = totalCurrentValuation < 1000 
    ? `₹${totalCurrentValuation.toFixed(2)}` 
    : format_indian_currency(Math.round(totalCurrentValuation));

  const fmtTotalInv = totalInvested < 1000 
    ? `₹${totalInvested.toFixed(2)}` 
    : format_indian_currency(Math.round(totalInvested));

  const fmtTotalPnl = totalPnl >= 0 
    ? `+₹${Math.abs(totalPnl).toFixed(2)}` 
    : `-₹${Math.abs(totalPnl).toFixed(2)}`;

  return {
    is_connected: true,
    source: 'MFCentral (Official CAMS + KFintech RTA)',
    sync_mode: 'OFFICIAL_RTA_CAS',
    holdings: enrichedHoldings,
    holding_count: enrichedHoldings.length,
    direct_plan_count: directPlanCount,
    regular_plan_count: regularPlanCount,
    direct_purity_pct: directPurityPct,
    has_regular_leakage: regularPlanCount > 0,
    total_invested: Math.round(totalInvested * 100) / 100,
    formatted_total_invested: fmtTotalInv,
    current_valuation: Math.round(totalCurrentValuation * 100) / 100,
    formatted_current_valuation: fmtTotalVal,
    total_pnl: Math.round(totalPnl * 100) / 100,
    formatted_total_pnl: `${fmtTotalPnl} (${overallPnlPct}%)`,
    total_pnl_pct: overallPnlPct,
    active_monthly_sip: activeMonthlySip,
    formatted_active_sip: activeMonthlySip > 0 ? `${format_indian_currency(activeMonthlySip)}/mo` : 'None detected',
    synced_at: new Date().toISOString(),
  };
}

/**
 * Storage Helpers
 */
export function getSavedMFCentralSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MFCENTRAL);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse MFCentral session:', err);
    return null;
  }
}

export function saveMFCentralSession(sessionData) {
  try {
    localStorage.setItem(STORAGE_KEY_MFCENTRAL, JSON.stringify(sessionData));
  } catch (err) {
    console.error('Failed to save MFCentral session:', err);
  }
}

export function clearMFCentralSession() {
  try {
    localStorage.removeItem(STORAGE_KEY_MFCENTRAL);
  } catch (err) {}
}
