/**
 * Botsfirm PaySphere — PAYE Service
 * Wrapper around tax engine only.
 * NO bracket logic allowed here.
 *
 * CONTRACT — calculateMonthlyPAYE always returns:
 * {
 *   monthlyPAYE: number,
 *   annualPAYE: number,
 *   effectiveRate: number,
 *   nationalityStatus: string,
 *   taxableIncome: number
 * }
 */

const {
  calculateMonthlyTax,
  calculateAnnualTax,
  getEffectiveTaxRate,
  validateMinimumWage,
} = require('../utils/taxBrackets');

/**
 * Calculate monthly PAYE for an employee
 * @param {number} monthlyTaxableIncome - Basic + taxable allowances
 * @param {string} nationalityStatus - citizen | resident_non_citizen | non_resident
 * @returns {{ monthlyPAYE, annualPAYE, effectiveRate, nationalityStatus, taxableIncome }}
 */
const calculateMonthlyPAYE = (monthlyTaxableIncome, nationalityStatus) => {
  const monthlyPAYE = calculateMonthlyTax(monthlyTaxableIncome, nationalityStatus);
  const annualPAYE = calculateAnnualTax(monthlyTaxableIncome * 12, nationalityStatus);
  const effectiveRate = getEffectiveTaxRate(monthlyTaxableIncome, nationalityStatus);

  return {
    monthlyPAYE,
    annualPAYE,
    effectiveRate,
    nationalityStatus,
    taxableIncome: monthlyTaxableIncome,
  };
};

/**
 * Calculate annual PAYE for an employee
 * @param {number} annualTaxableIncome
 * @param {string} nationalityStatus
 * @returns {{ annualPAYE, monthlyPAYE, effectiveRate, nationalityStatus, taxableIncome }}
 */
const calculateAnnualPAYE = (annualTaxableIncome, nationalityStatus) => {
  const annualPAYE = calculateAnnualTax(annualTaxableIncome, nationalityStatus);
  const monthlyPAYE = Number((annualPAYE / 12).toFixed(2));
  const effectiveRate = annualTaxableIncome > 0
    ? Number(((annualPAYE / annualTaxableIncome) * 100).toFixed(2))
    : 0;

  return {
    annualPAYE,
    monthlyPAYE,
    effectiveRate,
    nationalityStatus,
    taxableIncome: annualTaxableIncome,
  };
};

const validateEmployeeSalary = (monthlySalary) => {
  return validateMinimumWage(monthlySalary);
};

module.exports = {
  calculateMonthlyPAYE,
  calculateAnnualPAYE,
  validateEmployeeSalary,
};