/**
 * @file taxBrackets.js
 * @module backend/utils/taxBrackets
 *
 * Botswana PAYE tax calculation engine.
 *
 * Source: Botswana Unified Revenue Service (BURS) PAYE schedule
 * as published in the PwC Tax Summaries — Botswana page (last
 * reviewed January 2026). Brackets below are stated in annual BWP.
 *
 * Method
 * ------
 * Botswana PAYE is computed on an annualised basis. To produce a
 * monthly PAYE figure we:
 *   1. Annualise the monthly taxable income (× 12).
 *   2. Apply the appropriate annual bracket table (resident vs non-resident).
 *   3. Divide the annual tax by 12 to recover the monthly PAYE.
 *
 * Residents / citizens enjoy a BWP 48,000 tax-free threshold.
 * Non-residents do not — they are taxed from the first pula at 5%.
 *
 * Annual brackets — RESIDENTS / CITIZENS
 * ---------------------------------------
 *   BWP        0   –    48,000   : 0% (tax free)
 *   BWP   48,001   –    84,000   : 5% on excess over 48,000
 *   BWP   84,001   –   120,000   : 1,800 + 12.5%  on excess over 84,000
 *   BWP  120,001   –   156,000   : 6,300 + 18.75% on excess over 120,000
 *   BWP  156,001   –   ∞         : 13,050 + 25%   on excess over 156,000
 *
 * Annual brackets — NON-RESIDENTS
 * --------------------------------
 *   BWP        0   –    84,000   : 5%   on all income (no tax-free band)
 *   BWP   84,001   –   120,000   : 4,200  + 12.5%  on excess over 84,000
 *   BWP  120,001   –   156,000   : 8,700  + 18.75% on excess over 120,000
 *   BWP  156,001   –   ∞         : 15,450 + 25%    on excess over 156,000
 *
 * Verification examples (see unit tests too)
 * ------------------------------------------
 *   Citizen BWP  5,000 / month  =>  annual 60,000
 *     band 48k-84k: 5% × (60,000 − 48,000) = 600 / year => 50.00 / month
 *
 *   Citizen BWP 12,000 / month  =>  annual 144,000
 *     band 120k-156k: 6,300 + 18.75% × 24,000 = 10,800 / year => 900.00 / month
 *
 *   Citizen BWP 20,000 / month  =>  annual 240,000
 *     band 156k+:    13,050 + 25%    × 84,000 = 34,050 / year => 2,837.50 / month
 *
 *   Non-citizen BWP 12,000 / month  =>  annual 144,000
 *     band 120k-156k: 8,700 + 18.75% × 24,000 = 13,200 / year => 1,100.00 / month
 *
 * @author  Botsfirm PaySphere
 */

'use strict';

// ---------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------

/**
 * Annual PAYE brackets for residents and citizens of Botswana.
 *
 * Each entry describes the band [floor, ceiling] in BWP, the marginal
 * rate that applies *within* the band, and the cumulative tax already
 * owed at `floor` (so `baseTax` is the amount owed once you reach
 * exactly `floor` BWP of taxable income).
 *
 * @type {{ floor: number, ceiling: number, rate: number, baseTax: number }[]}
 */
const RESIDENT_BRACKETS = [
    { floor: 0,        ceiling: 48000,             rate: 0,      baseTax: 0      },
    { floor: 48000,    ceiling: 84000,             rate: 0.05,   baseTax: 0      },
    { floor: 84000,    ceiling: 120000,            rate: 0.125,  baseTax: 1800   },
    { floor: 120000,   ceiling: 156000,            rate: 0.1875, baseTax: 6300   },
    { floor: 156000,   ceiling: Number.POSITIVE_INFINITY, rate: 0.25,   baseTax: 13050 }
];

/**
 * Annual PAYE brackets for non-residents.
 * @type {{ floor: number, ceiling: number, rate: number, baseTax: number }[]}
 */
const NON_RESIDENT_BRACKETS = [
    { floor: 0,        ceiling: 84000,             rate: 0.05,   baseTax: 0      },
    { floor: 84000,    ceiling: 120000,            rate: 0.125,  baseTax: 4200   },
    { floor: 120000,   ceiling: 156000,            rate: 0.1875, baseTax: 8700   },
    { floor: 156000,   ceiling: Number.POSITIVE_INFINITY, rate: 0.25,   baseTax: 15450 }
];

/** Minimum wage in BWP per hour, effective January 2026. */
const MINIMUM_HOURLY_WAGE_BWP = 9.06;

/** SDL is levied on employers whose annual turnover exceeds BWP 1,000,000. */
const SDL_TURNOVER_THRESHOLD_BWP = 1_000_000;

/** SDL rate (0.2% of monthly gross payroll / turnover). */
const SDL_RATE = 0.002;

// ---------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------

/**
 * Resolve the bracket table given a nationality status string.
 *
 * Citizens and resident non-citizens are taxed using the resident
 * table; only `non_resident` falls under the non-resident schedule.
 *
 * @param {('citizen'|'resident_non_citizen'|'non_resident'|'resident'|'non-resident')} nationalityStatus
 * @returns {{ floor: number, ceiling: number, rate: number, baseTax: number }[]}
 */
function selectBrackets(nationalityStatus) {
    const status = String(nationalityStatus || '').toLowerCase();
    if (status === 'non_resident' || status === 'non-resident' || status === 'nonresident') {
        return NON_RESIDENT_BRACKETS;
    }
    // citizen, resident_non_citizen, resident — all use the resident table.
    return RESIDENT_BRACKETS;
}

/**
 * Round a monetary BWP amount to two decimal places, half-away-from-zero.
 * @param {number} amount
 * @returns {number}
 */
function round2(amount) {
    if (!Number.isFinite(amount)) return 0;
    // Add a small epsilon-equivalent via Math.sign to avoid bias on .5 cases.
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Validate that a numeric input is finite and non-negative.
 * @param {*} value
 * @param {string} label
 * @returns {number}
 */
function assertNonNegativeNumber(value, label) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
        throw new TypeError(`${label} must be a finite, non-negative number (received: ${value})`);
    }
    return n;
}

// ---------------------------------------------------------------------
// Core calculations
// ---------------------------------------------------------------------

/**
 * Compute annual PAYE on a given annual taxable income.
 *
 * Walks the appropriate bracket table once. If `annualSalary` is zero
 * or negative it returns 0.
 *
 * @param {number} annualSalary - Annual taxable income in BWP.
 * @param {string} nationalityStatus - 'citizen' | 'resident_non_citizen' | 'non_resident'.
 * @returns {number} Annual PAYE in BWP, rounded to 2 decimals.
 *
 * @example
 *   calculateAnnualPAYE(60000,  'citizen');      //  600.00
 *   calculateAnnualPAYE(144000, 'citizen');      // 10800.00
 *   calculateAnnualPAYE(240000, 'citizen');      // 34050.00
 *   calculateAnnualPAYE(144000, 'non_resident'); // 13200.00
 */
function calculateAnnualPAYE(annualSalary, nationalityStatus) {
    const income = assertNonNegativeNumber(annualSalary, 'annualSalary');
    if (income === 0) return 0;

    const brackets = selectBrackets(nationalityStatus);

    // Locate the band that contains `income`.
    for (const band of brackets) {
        if (income > band.floor && income <= band.ceiling) {
            const tax = band.baseTax + (income - band.floor) * band.rate;
            return round2(tax);
        }
    }

    // Fallback: income exceeds the top ceiling (shouldn't happen — top is ∞).
    const top = brackets[brackets.length - 1];
    return round2(top.baseTax + (income - top.floor) * top.rate);
}

/**
 * Compute monthly PAYE from a monthly salary, using the annualisation method.
 *
 * Steps:
 *   1. annual = monthlySalary × 12
 *   2. annualTax = calculateAnnualPAYE(annual, nationalityStatus)
 *   3. monthlyPAYE = annualTax / 12
 *
 * @param {number} monthlySalary - Monthly taxable income (basic + taxable allowances − taxable deductions).
 * @param {string} nationalityStatus - 'citizen' | 'resident_non_citizen' | 'non_resident'.
 * @returns {number} Monthly PAYE in BWP, rounded to 2 decimals.
 *
 * @example
 *   calculateMonthlyPAYE( 5000, 'citizen');         //   50.00
 *   calculateMonthlyPAYE(12000, 'citizen');         //  900.00
 *   calculateMonthlyPAYE(20000, 'citizen');         // 2837.50
 *   calculateMonthlyPAYE(12000, 'non_resident');    // 1100.00
 */
function calculateMonthlyPAYE(monthlySalary, nationalityStatus) {
    const monthly = assertNonNegativeNumber(monthlySalary, 'monthlySalary');
    const annual = monthly * 12;
    const annualTax = calculateAnnualPAYE(annual, nationalityStatus);
    return round2(annualTax / 12);
}

/**
 * Return the *effective* tax rate (annual PAYE ÷ annual income) for a
 * given monthly salary, expressed as a percentage (not a fraction).
 *
 * Returns 0 for zero income to avoid divide-by-zero.
 *
 * @param {number} monthlySalary - Monthly taxable income in BWP.
 * @param {string} nationalityStatus
 * @returns {number} Effective rate as a percentage, e.g. 7.5 means 7.5%.
 *
 * @example
 *   getEffectiveTaxRate(20000, 'citizen'); // ≈ 14.19 (i.e. 14.19%)
 */
function getEffectiveTaxRate(monthlySalary, nationalityStatus) {
    const monthly = assertNonNegativeNumber(monthlySalary, 'monthlySalary');
    if (monthly === 0) return 0;
    const annual = monthly * 12;
    const annualTax = calculateAnnualPAYE(annual, nationalityStatus);
    return round2((annualTax / annual) * 100);
}

// ---------------------------------------------------------------------
// Compliance helpers
// ---------------------------------------------------------------------

/**
 * Verify a given hourly rate meets the Botswana statutory minimum wage.
 *
 * The general minimum wage is BWP 9.06 per hour effective January 2026.
 * Sectoral minimums (e.g. domestic, agriculture) may differ — handle
 * those at the sector layer; this function enforces the general floor.
 *
 * @param {number} hourlyRate - Hourly rate in BWP.
 * @returns {{ compliant: boolean, hourlyRate: number, minimumRequired: number, shortfall: number }}
 *
 * @example
 *   validateMinimumWage(10);   // { compliant: true,  ... }
 *   validateMinimumWage(8);    // { compliant: false, shortfall: 1.06 }
 */
function validateMinimumWage(hourlyRate) {
    const rate = assertNonNegativeNumber(hourlyRate, 'hourlyRate');
    const compliant = rate >= MINIMUM_HOURLY_WAGE_BWP;
    return {
        compliant,
        hourlyRate: round2(rate),
        minimumRequired: MINIMUM_HOURLY_WAGE_BWP,
        shortfall: compliant ? 0 : round2(MINIMUM_HOURLY_WAGE_BWP - rate)
    };
}

/**
 * Compute monthly Skills Development Levy (SDL) for an employer.
 *
 * Botswana levies SDL at 0.2% of monthly turnover (or gross payroll,
 * depending on how the employer is assessed) for businesses whose
 * annual turnover exceeds BWP 1,000,000. Employers below the threshold
 * are exempt.
 *
 * The caller passes in the *monthly* turnover figure; we infer
 * eligibility by annualising (× 12) and comparing against the
 * threshold.
 *
 * @param {number} monthlyTurnover - Monthly turnover or gross payroll in BWP.
 * @returns {number} SDL payable for the month, in BWP (rounded to 2dp).
 *
 * @example
 *   calculateSDL(50000);   // annualised 600,000 (below threshold) => 0
 *   calculateSDL(100000);  // annualised 1,200,000 => 100000 * 0.002 = 200.00
 */
function calculateSDL(monthlyTurnover) {
    const monthly = assertNonNegativeNumber(monthlyTurnover, 'monthlyTurnover');
    const annualised = monthly * 12;
    if (annualised <= SDL_TURNOVER_THRESHOLD_BWP) return 0;
    return round2(monthly * SDL_RATE);
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------

module.exports = {
    // primary functions
    calculateMonthlyPAYE,
    calculateAnnualPAYE,
    getEffectiveTaxRate,
    validateMinimumWage,
    calculateSDL,

    // constants — exposed for testing and for downstream display
    RESIDENT_BRACKETS,
    NON_RESIDENT_BRACKETS,
    MINIMUM_HOURLY_WAGE_BWP,
    SDL_TURNOVER_THRESHOLD_BWP,
    SDL_RATE
};
