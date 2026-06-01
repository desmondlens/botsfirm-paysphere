/**
 * Botsfirm PaySphere — PAYE Tax Engine
 * ==============================================
 * SINGLE SOURCE OF TRUTH for all PAYE calculations.
 * Source: BURS / PwC Tax Summaries (January 2026)
 * Tax year: 2025/2026 (July 2025 — June 2026)
 *
 * ARCHITECTURE DECISION:
 * Option B selected — explicit cumulative bracket iteration.
 * No base values. Rates only. Self-validating by construction.
 * Rationale: eliminates hidden dependency between rate and base values.
 * Any rate update is a single-field change. No derived values to maintain.
 *
 * AUDIT TRAIL:
 * To update for a new tax year:
 * 1. Add new year key to TAX_TABLES
 * 2. Update CURRENT_TAX_YEAR constant
 * 3. No other changes required
 */

'use strict';

// ─── Tax Tables ───────────────────────────────────────────────────────────────
// Only rates and boundaries. No base values — these are derived, not stored.
// Source: BURS Income Tax Act, Schedule 1 (2025/2026)

const TAX_TABLES = {
  "2026": {
    resident: [
      { min: 0,      max: 48000,    rate: 0      }, // Tax-free threshold
      { min: 48000,  max: 84000,    rate: 0.05   }, // 5%
      { min: 84000,  max: 120000,   rate: 0.125  }, // 12.5%
      { min: 120000, max: 156000,   rate: 0.1875 }, // 18.75%
      { min: 156000, max: Infinity, rate: 0.25   }, // 25%
    ],
    non_resident: [
      { min: 0,      max: 84000,    rate: 0.05   }, // 5% from first pula
      { min: 84000,  max: 120000,   rate: 0.125  }, // 12.5%
      { min: 120000, max: 156000,   rate: 0.1875 }, // 18.75%
      { min: 156000, max: Infinity, rate: 0.25   }, // 25%
    ],
  },
};

const CURRENT_TAX_YEAR = "2026";
const MINIMUM_WAGE_HOURLY = 9.06;       // BWP per hour (effective January 2026)
const STANDARD_HOURS_PER_MONTH = 174;   // 40hr week × 4.35 weeks
const SDL_RATE = 0.002;                 // 0.2% of annual turnover
const SDL_THRESHOLD_ANNUAL = 1000000;   // BWP 1,000,000
const VALID_NATIONALITY_STATUSES = ['citizen', 'resident_non_citizen', 'non_resident'];

const validateBrackets = (brackets, year, tableKey) => {
  if (!brackets || brackets.length === 0) {
    throw new Error(`Tax table is empty for year "${year}" / "${tableKey}"`);
  }

  const sorted = [...brackets].sort((a, b) => a.min - b.min);

  if (sorted[0].min !== 0) {
    throw new Error(
      `First bracket must start at min: 0. Got: ${sorted[0].min} ` +
      `in "${year}/${tableKey}"`
    );
  }

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].min !== sorted[i - 1].max) {
      throw new Error(
        `Bracket ${i - 1} max (${sorted[i - 1].max}) does not equal ` +
        `bracket ${i} min (${sorted[i].min}) in "${year}/${tableKey}". ` +
        `Gap or overlap detected.`
      );
    }
  }

  if (sorted[sorted.length - 1].max !== Infinity) {
    throw new Error(
      `Last bracket max must be Infinity. ` +
      `Got: ${sorted[sorted.length - 1].max} in "${year}/${tableKey}"`
    );
  }

  for (const bracket of sorted) {
    if (typeof bracket.rate !== 'number' || bracket.rate < 0 || bracket.rate > 1) {
      throw new Error(
        `Invalid rate ${bracket.rate} at bracket min: ${bracket.min} ` +
        `in "${year}/${tableKey}". Rate must be between 0 and 1.`
      );
    }
  }

  return sorted;
};


// ─── Core Tax Engine ──────────────────────────────────────────────────────────

/**
 * Calculate annual PAYE using explicit cumulative bracket iteration.
 *
 * ALGORITHM:
 * For each bracket, calculate tax on the portion of income that falls
 * within that bracket only. Accumulate across all brackets.
 * No base values. No hidden dependencies.
 *
 * VERIFICATION (non-resident, BWP 180,000/year):
 *   Band 0–84,000:    84,000 × 0.05   = 4,200
 *   Band 84–120,000:  36,000 × 0.125  = 4,500
 *   Band 120–156,000: 36,000 × 0.1875 = 6,750
 *   Band 156–180,000: 24,000 × 0.25   = 6,000
 *   Total annual tax  = 21,450
 *   Monthly PAYE      = 1,787.50
 *
 * @param {number} annualIncome - Annual taxable income (BWP)
 * @param {string} nationalityStatus - citizen | resident_non_citizen | non_resident
 * @param {string} taxYear - Tax year key (default: CURRENT_TAX_YEAR)
 * @returns {number} Annual PAYE rounded to 2 decimal places
 * @throws {Error} If tax table not found or income is invalid
 */
const calculateAnnualTax = (annualIncome, nationalityStatus, taxYear = CURRENT_TAX_YEAR) => {
  // Input validation
  if (typeof annualIncome !== 'number' || isNaN(annualIncome)) {
    throw new Error(`Invalid annualIncome: ${annualIncome}. Must be a number.`);
  }
  if (annualIncome < 0) {
    throw new Error(`Annual income cannot be negative: ${annualIncome}`);
  }
  if (annualIncome === 0) return 0;

  if (!nationalityStatus) {
    throw new Error('nationalityStatus is required');
  }

  // Resolve table key
  const tableKey = (
    nationalityStatus === 'citizen' ||
    nationalityStatus === 'resident_non_citizen'
  ) ? 'resident' : 'non_resident';

  const brackets = TAX_TABLES[taxYear]?.[tableKey];
  if (!brackets || brackets.length === 0) {
    throw new Error(`Tax table not found for year "${taxYear}" and status "${nationalityStatus}"`);
  }

  // Safety: ensure brackets are sorted ascending by min
  // This prevents silent errors if table order is accidentally changed
  const sorted = [...brackets].sort((a, b) => a.min - b.min);

  let annualTax = 0;

  for (const bracket of sorted) {
    // No income in this bracket — stop iterating
    if (annualIncome <= bracket.min) break;

    // Income that falls within this bracket only
    const incomeInBracket = Math.min(annualIncome, bracket.max) - bracket.min;

    // Tax from this bracket only — accumulate, never overwrite
    annualTax += incomeInBracket * bracket.rate;
  }

  return Number(annualTax.toFixed(2));
};

/**
 * Calculate monthly PAYE.
 * Method: annualise → apply brackets → divide by 12.
 * This is the BURS-prescribed method for monthly PAYE withholding.
 *
 * @param {number} monthlyTaxableIncome - Monthly taxable income (BWP)
 * @param {string} nationalityStatus
 * @returns {number} Monthly PAYE rounded to 2 decimal places
 */
const calculateMonthlyTax = (monthlyTaxableIncome, nationalityStatus) => {
  if (typeof monthlyTaxableIncome !== 'number' || isNaN(monthlyTaxableIncome)) {
    throw new Error(`Invalid monthlyTaxableIncome: ${monthlyTaxableIncome}`);
  }
  if (monthlyTaxableIncome < 0) {
    throw new Error(`Monthly income cannot be negative: ${monthlyTaxableIncome}`);
  }
  if (monthlyTaxableIncome === 0) return 0;

  const annualIncome = monthlyTaxableIncome * 12;
  const annualTax = calculateAnnualTax(annualIncome, nationalityStatus);
  return Number((annualTax / 12).toFixed(2));
};

/**
 * Get effective tax rate as a percentage.
 *
 * @param {number} monthlyTaxableIncome
 * @param {string} nationalityStatus
 * @returns {number} Effective rate as percentage (e.g. 12.50)
 */
const getEffectiveTaxRate = (monthlyTaxableIncome, nationalityStatus) => {
  if (!monthlyTaxableIncome || monthlyTaxableIncome <= 0) return 0;
  const paye = calculateMonthlyTax(monthlyTaxableIncome, nationalityStatus);
  return Number(((paye / monthlyTaxableIncome) * 100).toFixed(2));
};

/**
 * Validate salary against Botswana minimum wage.
 *
 * @param {number} monthlySalary - Monthly salary (BWP)
 * @param {number} hoursPerMonth - Hours per month (default 174)
 * @returns {{ valid, minimumMonthly, message }}
 */
const validateMinimumWage = (monthlySalary, hoursPerMonth = STANDARD_HOURS_PER_MONTH) => {
  const minimumMonthly = Number((MINIMUM_WAGE_HOURLY * hoursPerMonth).toFixed(2));
  const valid = monthlySalary >= minimumMonthly;
  return {
    valid,
    minimumMonthly,
    hourlyRate: MINIMUM_WAGE_HOURLY,
    message: valid
      ? `Salary BWP ${monthlySalary} meets minimum wage of BWP ${minimumMonthly}/month`
      : `Salary BWP ${monthlySalary} is below minimum wage of BWP ${minimumMonthly}/month`,
  };
};

/**
 * Calculate Skills Development Levy.
 * Applicable to companies with annual turnover above BWP 1,000,000.
 *
 * @param {number} annualTurnover - Company annual turnover (BWP)
 * @returns {number} Monthly SDL amount
 */
const calculateSDL = (annualTurnover) => {
  if (!annualTurnover || annualTurnover < SDL_THRESHOLD_ANNUAL) return 0;
  return Number(((annualTurnover * SDL_RATE) / 12).toFixed(2));
};

// ─── Boundary Verification (self-documenting) ─────────────────────────────────
// These are the expected cumulative tax values at each bracket boundary.
// Used for unit testing and audit verification.

const RESIDENT_BOUNDARY_CHECKS = [
  { annualIncome: 48000,  expectedAnnualTax: 0        },
  { annualIncome: 84000,  expectedAnnualTax: 1800     },
  { annualIncome: 120000, expectedAnnualTax: 6300     },
  { annualIncome: 156000, expectedAnnualTax: 13050    },
];

const NON_RESIDENT_BOUNDARY_CHECKS = [
  { annualIncome: 84000,  expectedAnnualTax: 4200     },
  { annualIncome: 120000, expectedAnnualTax: 8700     },
  { annualIncome: 156000, expectedAnnualTax: 15450    },
  { annualIncome: 180000, expectedAnnualTax: 21450    },
];

// Validate all tax tables on module load
// Any misconfiguration throws immediately when server starts
const validateAllTables = () => {
  for (const year of Object.keys(TAX_TABLES)) {
    for (const tableKey of Object.keys(TAX_TABLES[year])) {
      validateBrackets(TAX_TABLES[year][tableKey], year, tableKey);
    }
  }
};

validateAllTables();
// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  calculateAnnualTax,
  calculateMonthlyTax,
  getEffectiveTaxRate,
  validateMinimumWage,
  calculateSDL,
  validateBrackets,
  TAX_TABLES,
  CURRENT_TAX_YEAR,
  MINIMUM_WAGE_HOURLY,
  STANDARD_HOURS_PER_MONTH,
  RESIDENT_BOUNDARY_CHECKS,
  NON_RESIDENT_BOUNDARY_CHECKS,
};