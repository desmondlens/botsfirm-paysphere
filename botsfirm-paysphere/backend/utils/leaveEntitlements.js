/**
 * @file leaveEntitlements.js
 * @module backend/utils/leaveEntitlements
 *
 * Botswana Employment Act leave entitlements and eligibility rules.
 *
 * Statutory entitlements (full-time employee, per year)
 * -----------------------------------------------------
 *   Annual leave   : 15 working days
 *                    8 days must be taken in first 6 months
 *                    Unused days roll over up to 3 years, then expire
 *   Sick leave     : 20 working days, 100% paid
 *                    Doctor's certificate required for absences > 1 day
 *   Maternity      : 12 weeks = 84 calendar days
 *                    6 weeks before, 6 weeks after birth
 *                    50% of basic pay
 *   Paternity      : 5 working days, 100% paid
 *   Family resp.   : 3 working days per year, 100% paid
 *
 * Working time rules
 * ------------------
 *   Working week   : maximum 48 hours
 *   Overtime       : 150% of basic hourly rate
 *                    Cap: 14 overtime hours per week
 *   Minimum wage   : BWP 9.06 per hour (effective January 2026)
 *
 * Convention notes
 * ----------------
 *   * Annual leave accrues at 15 ÷ 12 = 1.25 days per calendar month.
 *   * Sick leave is granted in full on entitlement date (not accrued
 *     monthly) but cannot be carried over.
 *   * Maternity / paternity / family-responsibility are event-based;
 *     they do not accrue, they are granted when the event occurs.
 *
 * All durations returned by this module are *days* unless explicitly
 * documented otherwise.
 *
 * @author Botsfirm PaySphere
 */

'use strict';

// ---------------------------------------------------------------------
// Statutory constants
// ---------------------------------------------------------------------

/** Maximum hours an employee may work in a single week. */
const MAX_WEEKLY_HOURS = 48;

/** Maximum overtime hours per week. */
const MAX_WEEKLY_OVERTIME_HOURS = 14;

/** Overtime multiplier (150% of basic hourly rate). */
const OVERTIME_MULTIPLIER = 1.5;

/** Statutory minimum hourly wage in BWP (effective January 2026). */
const MINIMUM_HOURLY_WAGE_BWP = 9.06;

/** Calendar months in one accrual year. */
const MONTHS_PER_YEAR = 12;

/** Working days per month, used to convert leave days to pay days. */
const WORKING_DAYS_PER_MONTH = 22;

/**
 * Botswana Employment Act leave entitlement table.
 * Keyed by leave-type code (matches `leave_types.code` in the DB schema).
 *
 * Fields:
 *   - daysEntitlement      : full annual entitlement in days
 *   - accrualMethod        : 'monthly' (1.25/mo for annual leave) or 'event'
 *   - carryOverDays        : max days that roll into the next year (annual only)
 *   - carryOverYears       : how many years the carry-over remains valid
 *   - requiresCertificate  : doctor's note required (sick leave)
 *   - isPaid               : whether leave is paid
 *   - payPercentage        : percent of basic salary paid during leave
 *   - mustTakeInFirstHalf  : days that must be taken in first 6 months
 *   - mustTakeInFirstHalfDays : how many days of the entitlement must
 *                            be taken in the first 6 months (annual leave)
 */
const LEAVE_ENTITLEMENTS = Object.freeze({
    annual: {
        code: 'annual',
        name: 'Annual Leave',
        daysEntitlement: 15,
        accrualMethod: 'monthly',
        carryOverDays: 7,
        carryOverYears: 3,
        requiresCertificate: false,
        isPaid: true,
        payPercentage: 100,
        mustTakeInFirstHalfDays: 8
    },
    sick: {
        code: 'sick',
        name: 'Sick Leave',
        daysEntitlement: 20,
        accrualMethod: 'annual',
        carryOverDays: 0,
        carryOverYears: 0,
        requiresCertificate: true,
        isPaid: true,
        payPercentage: 100,
        mustTakeInFirstHalfDays: 0
    },
    maternity: {
        code: 'maternity',
        name: 'Maternity Leave',
        daysEntitlement: 84,        // 12 weeks = 84 calendar days
        accrualMethod: 'event',
        carryOverDays: 0,
        carryOverYears: 0,
        requiresCertificate: true,
        isPaid: true,
        payPercentage: 50,
        mustTakeInFirstHalfDays: 0
    },
    paternity: {
        code: 'paternity',
        name: 'Paternity Leave',
        daysEntitlement: 5,
        accrualMethod: 'event',
        carryOverDays: 0,
        carryOverYears: 0,
        requiresCertificate: false,
        isPaid: true,
        payPercentage: 100,
        mustTakeInFirstHalfDays: 0
    },
    family_responsibility: {
        code: 'family_responsibility',
        name: 'Family Responsibility Leave',
        daysEntitlement: 3,
        accrualMethod: 'annual',
        carryOverDays: 0,
        carryOverYears: 0,
        requiresCertificate: false,
        isPaid: true,
        payPercentage: 100,
        mustTakeInFirstHalfDays: 0
    },
    unpaid: {
        code: 'unpaid',
        name: 'Unpaid Leave',
        daysEntitlement: 0,
        accrualMethod: 'event',
        carryOverDays: 0,
        carryOverYears: 0,
        requiresCertificate: false,
        isPaid: false,
        payPercentage: 0,
        mustTakeInFirstHalfDays: 0
    }
});

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function round2(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertNonNegativeNumber(value, label) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
        throw new TypeError(`${label} must be a finite non-negative number (received: ${value})`);
    }
    return n;
}

/**
 * Normalise a leave-type input to a known code, throwing on unknowns.
 * Accepts either a string code ('annual') or an object with `.code`.
 * @param {string|{code: string}} leaveType
 * @returns {{ code: string, [k: string]: any }} The matching entitlement spec.
 */
function resolveLeaveType(leaveType) {
    const code = typeof leaveType === 'string'
        ? leaveType
        : (leaveType && leaveType.code);
    if (!code) {
        throw new TypeError('leaveType must be a code string or an object with a .code field');
    }
    const spec = LEAVE_ENTITLEMENTS[code];
    if (!spec) {
        throw new RangeError(
            `Unknown leave type "${code}". Known: ${Object.keys(LEAVE_ENTITLEMENTS).join(', ')}`
        );
    }
    return spec;
}

/**
 * Whole months between two dates, floored. Used for service-month math.
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number}
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
// Entitlement lookup
// ---------------------------------------------------------------------

/**
 * Return the full statutory entitlement spec for a leave type.
 * @param {string} code - e.g. 'annual', 'sick', 'maternity'.
 * @returns {object} Frozen entitlement object.
 */
function getEntitlement(code) {
    return resolveLeaveType(code);
}

/**
 * Return all known leave-type codes.
 * @returns {string[]}
 */
function listLeaveTypeCodes() {
    return Object.keys(LEAVE_ENTITLEMENTS);
}

// ---------------------------------------------------------------------
// Accrual
// ---------------------------------------------------------------------

/**
 * Calculate how many leave days an employee has accrued from their
 * start date up to (and including) a reference date.
 *
 * Behaviour by leave type:
 *   * annual leave: accrues at 1.25 days per completed calendar month.
 *   * sick / family responsibility (annual accrual): full entitlement
 *     granted at the start of each leave year — function returns the
 *     full entitlement once the employee has crossed the start-of-year
 *     boundary, prorated for the first partial year.
 *   * event leaves (maternity/paternity/unpaid): always return 0 —
 *     they are granted on application, not accrued.
 *
 * @param {Date|string} employeeStartDate - Employment / contract start date.
 * @param {string|{code: string}} leaveType
 * @param {Date|string} [asOfDate] - Reference date (default = now).
 * @returns {{ leaveType: string,
 *             monthsServed: number,
 *             daysAccrued: number,
 *             annualEntitlement: number,
 *             method: string }}
 *
 * @example
 *   // After 6 months of service:
 *   calculateLeaveAccrual('2025-11-23', 'annual', '2026-05-23');
 *   // => { daysAccrued: 7.5, monthsServed: 6, ... }
 */
function calculateLeaveAccrual(employeeStartDate, leaveType, asOfDate = new Date()) {
    const spec = resolveLeaveType(leaveType);
    const monthsServed = monthsBetween(employeeStartDate, asOfDate);

    let daysAccrued = 0;
    switch (spec.accrualMethod) {
        case 'monthly':
            // Annual leave: 1.25 days per completed month, capped at
            // entitlement plus statutory carry-over for the look-back
            // period. We don't cap here — the leave_balances row holds
            // history; callers should subtract `taken` to get usable.
            daysAccrued = (spec.daysEntitlement / MONTHS_PER_YEAR) * monthsServed;
            break;

        case 'annual':
            // Granted in full each year of service. Prorate the first
            // partial year by months served vs MONTHS_PER_YEAR.
            if (monthsServed >= MONTHS_PER_YEAR) {
                daysAccrued = spec.daysEntitlement;
            } else {
                daysAccrued = (spec.daysEntitlement / MONTHS_PER_YEAR) * monthsServed;
            }
            break;

        case 'event':
        default:
            daysAccrued = 0;
            break;
    }

    return {
        leaveType: spec.code,
        monthsServed,
        daysAccrued: round2(daysAccrued),
        annualEntitlement: spec.daysEntitlement,
        method: spec.accrualMethod
    };
}

// ---------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------

/**
 * Check whether an employee is eligible for a leave request of the
 * requested type and length.
 *
 * Inputs:
 *   `employee` is expected to expose:
 *     - contract_start_date (Date or ISO string)
 *     - gender? (optional; 'male' / 'female' — affects maternity/paternity)
 *     - is_active (boolean)
 *
 *   `balance` (optional) is the current `leave_balances` row for this
 *   employee + leave type for the relevant year:
 *     - closing_balance (number)
 *     - pending (number)
 *
 * @param {object} employee
 * @param {string|{code: string}} leaveType
 * @param {number} daysRequested
 * @param {{ closing_balance?: number, pending?: number }} [balance]
 * @returns {{ eligible: boolean, reason?: string, warnings: string[] }}
 */
function checkLeaveEligibility(employee, leaveType, daysRequested, balance = {}) {
    if (!employee || typeof employee !== 'object') {
        throw new TypeError('employee must be an object');
    }
    const spec = resolveLeaveType(leaveType);
    const days = assertNonNegativeNumber(daysRequested, 'daysRequested');

    const warnings = [];

    if (!employee.is_active) {
        return { eligible: false, reason: 'Employee is not active', warnings };
    }
    if (days <= 0) {
        return { eligible: false, reason: 'daysRequested must be > 0', warnings };
    }

    // Gender-specific checks (when gender is provided).
    if (employee.gender) {
        const g = String(employee.gender).toLowerCase();
        if (spec.code === 'maternity' && g !== 'female') {
            return { eligible: false, reason: 'Maternity leave is only available to female employees', warnings };
        }
        if (spec.code === 'paternity' && g !== 'male') {
            return { eligible: false, reason: 'Paternity leave is only available to male employees', warnings };
        }
    }

    // For accrued leave types, ensure the balance covers the request.
    if (spec.accrualMethod !== 'event') {
        const available = Number(balance.closing_balance || 0) - Number(balance.pending || 0);
        if (days > available) {
            return {
                eligible: false,
                reason: `Insufficient ${spec.name} balance: requested ${days}, available ${round2(available)}`,
                warnings
            };
        }
    }

    // Annual leave: warn if the employee is in their first 6 months but
    // has not yet taken the statutory minimum portion.
    if (spec.code === 'annual') {
        const monthsServed = monthsBetween(employee.contract_start_date, new Date());
        if (monthsServed < 6 && days < spec.mustTakeInFirstHalfDays) {
            warnings.push(
                `Employment Act requires at least ${spec.mustTakeInFirstHalfDays} days of annual leave to be taken in the first 6 months.`
            );
        }
    }

    // Sick leave: warn that certificate is required for > 1 day.
    if (spec.code === 'sick' && days > 1) {
        warnings.push('Medical certificate is required for sick leave longer than one day.');
    }

    // Hard-cap requests against the entitlement for non-accrued event leaves.
    if (spec.accrualMethod === 'event' && spec.daysEntitlement > 0 && days > spec.daysEntitlement) {
        return {
            eligible: false,
            reason: `${spec.name} entitlement is ${spec.daysEntitlement} days; requested ${days}`,
            warnings
        };
    }

    return { eligible: true, warnings };
}

// ---------------------------------------------------------------------
// Balance computation
// ---------------------------------------------------------------------

/**
 * Compute an employee's leave balance for a given year, given prior
 * carry-over and a record of taken/pending days.
 *
 * The shape mirrors the `leave_balances` table so the result can be
 * written straight back to the DB.
 *
 * @param {object} employee - Must have contract_start_date.
 * @param {string|{code: string}} leaveType
 * @param {number} year - Calendar year (e.g. 2026).
 * @param {{ taken?: number, pending?: number, carried_over_from_previous?: number, opening_balance?: number }} [history]
 * @returns {{ year: number,
 *             leaveType: string,
 *             opening_balance: number,
 *             accrued: number,
 *             taken: number,
 *             pending: number,
 *             closing_balance: number,
 *             carried_over_from_previous: number }}
 */
function calculateLeaveBalance(employee, leaveType, year, history = {}) {
    if (!employee || typeof employee !== 'object') {
        throw new TypeError('employee must be an object');
    }
    if (!year || !Number.isInteger(year)) {
        throw new TypeError('year must be an integer (e.g. 2026)');
    }
    const spec = resolveLeaveType(leaveType);

    const start = employee.contract_start_date instanceof Date
        ? employee.contract_start_date
        : new Date(employee.contract_start_date);
    if (Number.isNaN(start.getTime())) {
        throw new TypeError('employee.contract_start_date must be a valid date');
    }

    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31));
    const today = new Date();

    // Reference date: capped at the earlier of (today, year-end).
    const refDate = today < yearEnd ? today : yearEnd;

    // Accrual within this year: from max(employment-start, year-start) to refDate.
    const accrualStart = start > yearStart ? start : yearStart;

    let accrued = 0;
    if (refDate > accrualStart) {
        const monthsInYear = monthsBetween(accrualStart, refDate);
        switch (spec.accrualMethod) {
            case 'monthly':
                accrued = (spec.daysEntitlement / MONTHS_PER_YEAR) * monthsInYear;
                break;
            case 'annual':
                // Granted up-front at start of the year, prorated if mid-year start.
                if (start <= yearStart) {
                    accrued = spec.daysEntitlement;
                } else {
                    accrued = (spec.daysEntitlement / MONTHS_PER_YEAR) * monthsInYear;
                }
                break;
            case 'event':
            default:
                accrued = 0;
                break;
        }
    }

    const carriedOver = Number(history.carried_over_from_previous || 0);
    const opening = Number(history.opening_balance || carriedOver);
    const taken = Number(history.taken || 0);
    const pending = Number(history.pending || 0);

    const closing = opening + accrued - taken;

    return {
        year,
        leaveType: spec.code,
        opening_balance: round2(opening),
        accrued: round2(accrued),
        taken: round2(taken),
        pending: round2(pending),
        closing_balance: round2(closing),
        carried_over_from_previous: round2(carriedOver)
    };
}

// ---------------------------------------------------------------------
// Carry-over expiry
// ---------------------------------------------------------------------

/**
 * Determine whether a leave balance is older than the statutory
 * carry-over window and should be flagged for expiry.
 *
 * Rule: annual leave can be carried over for up to 3 years from the
 * year of accrual; balances older than that are forfeit.
 *
 * @param {{ year: number,
 *           leaveType?: string,
 *           closing_balance?: number,
 *           expires_at?: Date|string,
 *           carryOverYears?: number }} leaveBalance
 * @param {Date} [asOf=new Date()]
 * @returns {{ expired: boolean,
 *             expiresAt: Date,
 *             daysToExpiry: number,
 *             warning: ('expired'|'expiring_soon'|'ok') }}
 */
function checkCarryOverExpiry(leaveBalance, asOf = new Date()) {
    if (!leaveBalance || typeof leaveBalance !== 'object') {
        throw new TypeError('leaveBalance must be an object');
    }
    const code = leaveBalance.leaveType || 'annual';
    const spec = LEAVE_ENTITLEMENTS[code] || LEAVE_ENTITLEMENTS.annual;
    const carryOverYears = leaveBalance.carryOverYears != null
        ? Number(leaveBalance.carryOverYears)
        : spec.carryOverYears;

    // Resolve expiry date: prefer explicit `expires_at`, else compute from year.
    let expiresAt;
    if (leaveBalance.expires_at) {
        expiresAt = leaveBalance.expires_at instanceof Date
            ? leaveBalance.expires_at
            : new Date(leaveBalance.expires_at);
    } else if (Number.isInteger(leaveBalance.year)) {
        // Expires at the end of (year + carryOverYears).
        expiresAt = new Date(Date.UTC(leaveBalance.year + carryOverYears, 11, 31, 23, 59, 59));
    } else {
        throw new TypeError('leaveBalance must include either expires_at or year');
    }

    const today = asOf instanceof Date ? asOf : new Date(asOf);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToExpiry = Math.floor((expiresAt.getTime() - today.getTime()) / msPerDay);

    let warning;
    if (daysToExpiry < 0) {
        warning = 'expired';
    } else if (daysToExpiry <= 30) {
        warning = 'expiring_soon';
    } else {
        warning = 'ok';
    }

    return {
        expired: daysToExpiry < 0,
        expiresAt,
        daysToExpiry,
        warning
    };
}

// ---------------------------------------------------------------------
// Working-time / overtime helpers
// ---------------------------------------------------------------------

/**
 * Validate that scheduled overtime hours do not exceed the weekly cap.
 *
 * @param {number} regularWeeklyHours - Regular (non-overtime) hours scheduled this week.
 * @param {number} overtimeWeeklyHours - Overtime hours scheduled this week.
 * @returns {{ valid: boolean,
 *             totalWeeklyHours: number,
 *             overtimeHours: number,
 *             reason?: string }}
 */
function validateWeeklyHours(regularWeeklyHours, overtimeWeeklyHours) {
    const reg = assertNonNegativeNumber(regularWeeklyHours, 'regularWeeklyHours');
    const ot = assertNonNegativeNumber(overtimeWeeklyHours, 'overtimeWeeklyHours');
    if (ot > MAX_WEEKLY_OVERTIME_HOURS) {
        return {
            valid: false,
            totalWeeklyHours: round2(reg + ot),
            overtimeHours: round2(ot),
            reason: `Overtime ${ot}h exceeds statutory cap of ${MAX_WEEKLY_OVERTIME_HOURS}h/week`
        };
    }
    if (reg > MAX_WEEKLY_HOURS) {
        return {
            valid: false,
            totalWeeklyHours: round2(reg + ot),
            overtimeHours: round2(ot),
            reason: `Regular hours ${reg}h exceed statutory cap of ${MAX_WEEKLY_HOURS}h/week`
        };
    }
    return {
        valid: true,
        totalWeeklyHours: round2(reg + ot),
        overtimeHours: round2(ot)
    };
}

/**
 * Compute overtime pay due for a given number of overtime hours.
 *
 * @param {number} overtimeHours
 * @param {number} basicHourlyRate - Basic (non-overtime) hourly rate.
 * @returns {{ overtimeHours: number,
 *             basicHourlyRate: number,
 *             overtimeRate: number,
 *             overtimePay: number,
 *             cappedAtWeeklyMax: boolean }}
 */
function calculateOvertimePay(overtimeHours, basicHourlyRate) {
    const hours = assertNonNegativeNumber(overtimeHours, 'overtimeHours');
    const rate = assertNonNegativeNumber(basicHourlyRate, 'basicHourlyRate');
    const cappedHours = Math.min(hours, MAX_WEEKLY_OVERTIME_HOURS);
    const overtimeRate = rate * OVERTIME_MULTIPLIER;
    return {
        overtimeHours: round2(cappedHours),
        basicHourlyRate: round2(rate),
        overtimeRate: round2(overtimeRate),
        overtimePay: round2(cappedHours * overtimeRate),
        cappedAtWeeklyMax: hours > MAX_WEEKLY_OVERTIME_HOURS
    };
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------

module.exports = {
    // primary functions
    calculateLeaveAccrual,
    checkLeaveEligibility,
    calculateLeaveBalance,
    checkCarryOverExpiry,

    // working-time helpers
    validateWeeklyHours,
    calculateOvertimePay,

    // entitlement table access
    getEntitlement,
    listLeaveTypeCodes,
    LEAVE_ENTITLEMENTS,

    // constants
    MAX_WEEKLY_HOURS,
    MAX_WEEKLY_OVERTIME_HOURS,
    OVERTIME_MULTIPLIER,
    MINIMUM_HOURLY_WAGE_BWP,
    MONTHS_PER_YEAR,
    WORKING_DAYS_PER_MONTH,

    // small utilities re-exported for callers
    monthsBetween
};
