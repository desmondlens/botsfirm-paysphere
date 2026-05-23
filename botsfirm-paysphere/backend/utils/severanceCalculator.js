/**
 * @file severanceCalculator.js
 * @module backend/utils/severanceCalculator
 *
 * Botswana severance pay, gratuity, notice pay, and terminal-benefit
 * calculations per the Employment Act (Cap 47:01) as amended.
 *
 * Statutory rules implemented
 * ---------------------------
 *
 *  Severance (Employment Act § 28):
 *    Continuous service is required (typically 5+ years, though
 *    severance can accrue from month 1 in some employer policies).
 *    Days entitled =
 *        min(monthsServed, 60)  × 1 day  per month     // first 60 months
 *      + max(monthsServed − 60, 0) × 2 days per month  // each further month
 *    Daily rate = monthlySalary / 22 working days.
 *    Severance pay = daysAccrued × dailyRate.
 *
 *  Gratuity:
 *    Accrues each completed 60-month (5-year) cycle. For fixed-term
 *    employees gratuity is commonly 25 %–33 % of basic pay for the
 *    cycle. This module accrues at one cycle's worth (60 × monthly
 *    basic × default 25%) each cycle, and reports the next accrual
 *    date so HR can plan.
 *
 *  Notice (Employment Act § 18):
 *    Minimum notice depends on pay frequency.
 *      monthly     : one month
 *      fortnightly : two weeks
 *      weekly      : one week
 *
 *  Leave pay on termination:
 *    Outstanding accrued leave days are paid at the daily rate.
 *
 *  Daily rate:
 *    The Act uses (monthly basic salary ÷ 22 working days). This is
 *    the constant used here.
 *
 * All monetary returns are BWP rounded to 2 decimals.
 *
 * @author Botsfirm PaySphere
 */

'use strict';

// ---------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------

/** Standard working days per month per the Employment Act. */
const WORKING_DAYS_PER_MONTH = 22;

/** Months in a single gratuity cycle (5 years). */
const GRATUITY_CYCLE_MONTHS = 60;

/**
 * Default gratuity rate per cycle. 25% of the cycle's basic pay is
 * the most common rate seen in fixed-term contracts in Botswana.
 * Callers can override by passing a different rate to
 * `calculateGratuityAccrual`.
 */
const DEFAULT_GRATUITY_RATE = 0.25;

/** Number of severance days awarded per month, for the first 60 months. */
const SEVERANCE_DAYS_PER_MONTH_TIER1 = 1;

/** Number of severance days awarded per month beyond the 60th month. */
const SEVERANCE_DAYS_PER_MONTH_TIER2 = 2;

/** Statutory minimum notice in working / calendar days by pay frequency. */
const NOTICE_PERIODS = Object.freeze({
    monthly:      { days: 30, label: '1 month' },
    fortnightly:  { days: 14, label: '2 weeks' },
    weekly:       { days: 7,  label: '1 week'  }
});

// ---------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------

/**
 * Round to two decimals, half away from zero.
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validate a numeric input as a finite non-negative number.
 * @param {*} value
 * @param {string} label
 * @returns {number}
 */
function assertNonNegativeNumber(value, label) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
        throw new TypeError(`${label} must be a finite non-negative number (received: ${value})`);
    }
    return n;
}

/**
 * Compute the daily rate of pay from a monthly basic salary.
 * @param {number} monthlyBasicSalary
 * @returns {number} Daily rate in BWP.
 */
function dailyRate(monthlyBasicSalary) {
    const salary = assertNonNegativeNumber(monthlyBasicSalary, 'monthlyBasicSalary');
    return salary / WORKING_DAYS_PER_MONTH;
}

/**
 * Whole months between two dates, floored. Anchors on day-of-month —
 * if the termination day is earlier than the hire day-of-month, one
 * month is subtracted.
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Whole months (≥ 0).
 */
function monthsBetween(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new TypeError('monthsBetween requires two valid date inputs');
    }
    if (end <= start) return 0;

    let months = (end.getFullYear() - start.getFullYear()) * 12
                 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months -= 1;
    return Math.max(0, months);
}

// ---------------------------------------------------------------------
// Core terminal-benefit calculations
// ---------------------------------------------------------------------

/**
 * Calculate severance pay per the Employment Act formula.
 *
 *   first 60 months : 1 day per month
 *   thereafter      : 2 days per month
 *   pay             = totalDays × (monthlySalary / 22)
 *
 * @param {number} monthsServed - Whole months of continuous service.
 * @param {number} basicSalary - Monthly basic salary in BWP.
 * @returns {{ monthsServed: number,
 *             daysAccrued: number,
 *             dailyRate: number,
 *             severanceAmount: number,
 *             tier1Days: number,
 *             tier2Days: number }}
 *
 * @example
 *   calculateSeverance(36, 10000);  // 36 days × 454.55 = 16,363.64
 *   calculateSeverance(72, 10000);  // (60×1) + (12×2) = 84 days × 454.55 = 38,181.82
 */
function calculateSeverance(monthsServed, basicSalary) {
    const months = Math.floor(assertNonNegativeNumber(monthsServed, 'monthsServed'));
    const salary = assertNonNegativeNumber(basicSalary, 'basicSalary');

    const tier1Months = Math.min(months, GRATUITY_CYCLE_MONTHS);
    const tier2Months = Math.max(months - GRATUITY_CYCLE_MONTHS, 0);

    const tier1Days = tier1Months * SEVERANCE_DAYS_PER_MONTH_TIER1;
    const tier2Days = tier2Months * SEVERANCE_DAYS_PER_MONTH_TIER2;
    const daysAccrued = tier1Days + tier2Days;

    const rate = dailyRate(salary);
    const severanceAmount = daysAccrued * rate;

    return {
        monthsServed: months,
        daysAccrued,
        dailyRate: round2(rate),
        severanceAmount: round2(severanceAmount),
        tier1Days,
        tier2Days
    };
}

/**
 * Calculate gratuity accrual. Gratuity vests at the end of each
 * 60-month cycle. Within a cycle, the partial amount is shown but
 * is not yet "due".
 *
 * The cycle value (default 25% of basic × 60 months) can be customised
 * via the `rate` argument; some employers contract for higher rates.
 *
 * @param {number} monthsServed - Whole months of continuous service.
 * @param {number} basicSalary - Monthly basic salary in BWP.
 * @param {number} [rate=0.25] - Gratuity rate per cycle (0.25 = 25%).
 * @returns {{ monthsServed: number,
 *             completedCycles: number,
 *             monthsIntoCurrentCycle: number,
 *             monthsToNextCycle: number,
 *             vestedAmount: number,
 *             unvestedAmount: number,
 *             totalAccrued: number,
 *             ratePerCycle: number }}
 *
 * @example
 *   // 7 years (84 months) of service at BWP 10,000 basic, 25% rate.
 *   // One full cycle vested: 10,000 × 60 × 0.25 = 150,000.
 *   // 24 months into next cycle: 10,000 × 24 × 0.25 = 60,000 (unvested).
 *   calculateGratuityAccrual(84, 10000);
 */
function calculateGratuityAccrual(monthsServed, basicSalary, rate = DEFAULT_GRATUITY_RATE) {
    const months = Math.floor(assertNonNegativeNumber(monthsServed, 'monthsServed'));
    const salary = assertNonNegativeNumber(basicSalary, 'basicSalary');
    const ratePerCycle = Number(rate);
    if (!Number.isFinite(ratePerCycle) || ratePerCycle < 0 || ratePerCycle > 1) {
        throw new TypeError(`rate must be a fraction between 0 and 1 (received: ${rate})`);
    }

    const completedCycles = Math.floor(months / GRATUITY_CYCLE_MONTHS);
    const monthsIntoCurrentCycle = months % GRATUITY_CYCLE_MONTHS;
    const monthsToNextCycle = GRATUITY_CYCLE_MONTHS - monthsIntoCurrentCycle;

    const vestedAmount = completedCycles * GRATUITY_CYCLE_MONTHS * salary * ratePerCycle;
    const unvestedAmount = monthsIntoCurrentCycle * salary * ratePerCycle;
    const totalAccrued = vestedAmount + unvestedAmount;

    return {
        monthsServed: months,
        completedCycles,
        monthsIntoCurrentCycle,
        monthsToNextCycle,
        vestedAmount: round2(vestedAmount),
        unvestedAmount: round2(unvestedAmount),
        totalAccrued: round2(totalAccrued),
        ratePerCycle
    };
}

/**
 * Compute statutory minimum notice payment in lieu of working notice.
 *
 * If the employer terminates without giving notice, they must pay the
 * equivalent salary for the notice period. We compute the payment as
 * (notice days × daily rate), where:
 *   monthly:     30 days  ≈ one month of pay
 *   fortnightly: 14 days  ≈ two weeks of pay
 *   weekly:      7  days  ≈ one week of pay
 *
 * Note: for monthly employees this effectively equals one month's
 * basic salary (30/22 × monthly ≠ exact month, so we instead pay one
 * full monthly basic for the monthly frequency case — matching common
 * payroll practice).
 *
 * @param {('monthly'|'fortnightly'|'weekly')} payFrequency
 * @param {number} basicSalary - Monthly basic salary in BWP.
 * @returns {{ payFrequency: string,
 *             noticeDays: number,
 *             label: string,
 *             noticePayment: number }}
 */
function calculateNoticePayment(payFrequency, basicSalary) {
    const salary = assertNonNegativeNumber(basicSalary, 'basicSalary');
    const freq = String(payFrequency || '').toLowerCase();
    const config = NOTICE_PERIODS[freq];
    if (!config) {
        throw new TypeError(
            `payFrequency must be one of ${Object.keys(NOTICE_PERIODS).join(', ')} (received: ${payFrequency})`
        );
    }

    let payment;
    if (freq === 'monthly') {
        // Exactly one month's basic salary.
        payment = salary;
    } else {
        // Pro-rated against daily rate for fortnight/week cases.
        payment = config.days * dailyRate(salary);
    }

    return {
        payFrequency: freq,
        noticeDays: config.days,
        label: config.label,
        noticePayment: round2(payment)
    };
}

/**
 * Compute the cash value of outstanding leave days at termination.
 *
 *   leavePay = daysOwed × (basicSalary / 22)
 *
 * @param {number} daysOwed - Outstanding leave days (may be fractional).
 * @param {number} basicSalary - Monthly basic salary in BWP.
 * @returns {{ daysOwed: number, dailyRate: number, leavePay: number }}
 */
function calculateLeavePayOnTermination(daysOwed, basicSalary) {
    const days = assertNonNegativeNumber(daysOwed, 'daysOwed');
    const salary = assertNonNegativeNumber(basicSalary, 'basicSalary');
    const rate = dailyRate(salary);
    return {
        daysOwed: round2(days),
        dailyRate: round2(rate),
        leavePay: round2(days * rate)
    };
}

/**
 * Compute the complete set of terminal benefits for an employee.
 *
 * The employee record is expected to provide at minimum:
 *   - basic_salary (BWP, monthly)
 *   - pay_frequency ('monthly' | 'fortnightly' | 'weekly')
 *   - contract_start_date (Date or ISO string)
 *   - termination_date (Date or ISO string; defaults to today)
 *   - outstanding_leave_days (number; default 0)
 *   - gratuity_rate (number; default 0.25)
 *
 * @param {object} employee
 * @param {number} employee.basic_salary
 * @param {string} employee.pay_frequency
 * @param {Date|string} employee.contract_start_date
 * @param {Date|string} [employee.termination_date]
 * @param {number} [employee.outstanding_leave_days=0]
 * @param {number} [employee.gratuity_rate=0.25]
 * @returns {object} Combined breakdown of terminal benefits.
 */
function getTotalTerminalBenefits(employee) {
    if (!employee || typeof employee !== 'object') {
        throw new TypeError('employee must be an object');
    }

    const basicSalary = assertNonNegativeNumber(employee.basic_salary, 'employee.basic_salary');
    const payFrequency = employee.pay_frequency || 'monthly';
    const startDate = employee.contract_start_date;
    const endDate = employee.termination_date || new Date();
    const outstandingLeaveDays = employee.outstanding_leave_days || 0;
    const gratuityRate = typeof employee.gratuity_rate === 'number'
        ? employee.gratuity_rate
        : DEFAULT_GRATUITY_RATE;

    if (!startDate) {
        throw new TypeError('employee.contract_start_date is required');
    }

    const monthsServed = monthsBetween(startDate, endDate);

    const severance = calculateSeverance(monthsServed, basicSalary);
    const gratuity = calculateGratuityAccrual(monthsServed, basicSalary, gratuityRate);
    const notice = calculateNoticePayment(payFrequency, basicSalary);
    const leavePay = calculateLeavePayOnTermination(outstandingLeaveDays, basicSalary);

    const totalPayout = round2(
        severance.severanceAmount
        + gratuity.vestedAmount          // only vested gratuity is payable on exit
        + notice.noticePayment
        + leavePay.leavePay
    );

    return {
        monthsServed,
        basicSalary: round2(basicSalary),
        dailyRate: round2(dailyRate(basicSalary)),
        severance,
        gratuity,
        notice,
        leavePay,
        totalPayout
    };
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------

module.exports = {
    // primary functions
    calculateSeverance,
    calculateGratuityAccrual,
    calculateNoticePayment,
    calculateLeavePayOnTermination,
    getTotalTerminalBenefits,

    // helpers exposed for downstream / testing
    monthsBetween,
    dailyRate,

    // constants
    WORKING_DAYS_PER_MONTH,
    GRATUITY_CYCLE_MONTHS,
    DEFAULT_GRATUITY_RATE,
    NOTICE_PERIODS
};
