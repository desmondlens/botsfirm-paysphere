
/**
 * Botsfirm PaySphere — PDF Service
 * Generates professional payslip PDFs using PDFKit
 */

'use strict';

const PDFDocument = require('pdfkit');

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2B6CB0',
  text: '#2D3748',
  muted: '#718096',
  light: '#F7FAFC',
  border: '#E2E8F0',
  success: '#38A169',
  error: '#E53E3E',
  white: '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `BWP ${Number(n || 0).toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Generate a professional payslip PDF
 * @param {object} payslip - Payslip data from database
 * @param {object} employee - Employee record
 * @param {object} tenant - Company/tenant record
 * @param {Array} allowanceBreakdown - Allowance line items
 * @param {Array} deductionBreakdown - Deduction line items
 * @returns {Promise<Buffer>} PDF as buffer
 */
const generatePayslipPDF = (payslip, employee, tenant, allowanceBreakdown = [], deductionBreakdown = []) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Payslip - ${employee.full_name}`,
          Author: 'Botsfirm PaySphere',
          Subject: `Payslip for ${payslip.pay_period_month}/${payslip.pay_period_year}`,
        },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 80;
      let y = 40;

      // ── Header Bar ────────────────────────────────────────────────────────
      doc.rect(40, y, pageWidth, 60).fill(COLORS.primary);

      doc.fillColor(COLORS.white)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('Botsfirm PaySphere', 50, y + 10);

      doc.fontSize(10)
        .font('Helvetica')
        .text('Payroll Management Platform', 50, y + 32);

      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('PAYSLIP', pageWidth - 50, y + 10, { align: 'right', width: 90 });

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const periodLabel = `${monthNames[(payslip.pay_period_month || 1) - 1]} ${payslip.pay_period_year}`;

      doc.fontSize(10)
        .font('Helvetica')
        .text(periodLabel, pageWidth - 50, y + 32, { align: 'right', width: 90 });

      y += 75;

      // ── Company and Employee Info ──────────────────────────────────────────
      const colWidth = (pageWidth - 20) / 2;

      // Left — Company
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('EMPLOYER', 40, y);

      y += 14;

      doc.fillColor(COLORS.text)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(tenant?.company_name || 'Company Name', 40, y);

      doc.fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text(`BURS: ${tenant?.burs_number || '—'}`, 40, y + 15);

      // Right — Employee
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('EMPLOYEE', 40 + colWidth + 20, y - 14);

      doc.fillColor(COLORS.text)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(employee.full_name, 40 + colWidth + 20, y);

      doc.fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text(`${employee.job_title || ''} · ${employee.department || ''}`, 40 + colWidth + 20, y + 15)
        .text(`ID: ${employee.id_number || '—'} · ${employee.nationality_status || '—'}`, 40 + colWidth + 20, y + 27)
        .text(`Emp No: ${employee.employee_number || '—'}`, 40 + colWidth + 20, y + 39);

      y += 60;

      // ── Divider ───────────────────────────────────────────────────────────
      doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(1).stroke();
      y += 15;

      // ── Pay Details Row ───────────────────────────────────────────────────
      const detailCols = [
        { label: 'PAY PERIOD', value: periodLabel },
        { label: 'PAY DATE', value: payslip.pay_date || `30 ${periodLabel}` },
        { label: 'BANK', value: employee.bank_name || '—' },
        { label: 'ACCOUNT', value: employee.bank_account_number ? `****${employee.bank_account_number.slice(-4)}` : '—' },
      ];

      const detailWidth = pageWidth / 4;
      detailCols.forEach((col, i) => {
        doc.fillColor(COLORS.muted)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(col.label, 40 + (i * detailWidth), y);

        doc.fillColor(COLORS.text)
          .fontSize(10)
          .font('Helvetica')
          .text(col.value, 40 + (i * detailWidth), y + 12);
      });

      y += 35;
      doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(1).stroke();
      y += 15;

      // ── Earnings Table ────────────────────────────────────────────────────
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('EARNINGS', 40, y);

      y += 12;

      // Table header
      doc.rect(40, y, pageWidth, 20).fill(COLORS.light);
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, y + 6)
        .text('TAX TREATMENT', 300, y + 6)
        .text('AMOUNT', 450, y + 6, { width: 80, align: 'right' });

      y += 22;

      // Basic salary row
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text('Basic Salary', 50, y);

      doc.fillColor(COLORS.error)
        .fontSize(9)
        .text('Taxable', 300, y);

      doc.fillColor(COLORS.text)
        .fontSize(10)
        .text(fmt(payslip.basic_salary), 450, y, { width: 80, align: 'right' });

      y += 18;
      doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
      y += 8;

      // Allowance rows
      allowanceBreakdown.forEach(a => {
        doc.fillColor(COLORS.text)
          .fontSize(10)
          .font('Helvetica')
          .text(a.name, 50, y);

        doc.fillColor(a.is_taxable ? COLORS.error : COLORS.success)
          .fontSize(9)
          .text(a.is_taxable ? 'Taxable' : 'Non-Taxable', 300, y);

        doc.fillColor(COLORS.text)
          .fontSize(10)
          .text(fmt(a.amount), 450, y, { width: 80, align: 'right' });

        y += 18;
        doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        y += 8;
      });

      // Gross pay row
      doc.rect(40, y, pageWidth, 22).fill(COLORS.light);
      doc.fillColor(COLORS.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Gross Pay', 50, y + 6)
        .text(fmt(payslip.gross_pay || (payslip.basic_salary + (payslip.total_taxable_allowances || 0) + (payslip.total_non_taxable_allowances || 0))), 450, y + 6, { width: 80, align: 'right' });

      y += 30;

      // ── Deductions Table ──────────────────────────────────────────────────
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DEDUCTIONS', 40, y);

      y += 12;

      doc.rect(40, y, pageWidth, 20).fill(COLORS.light);
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, y + 6)
        .text('AMOUNT', 450, y + 6, { width: 80, align: 'right' });

      y += 22;

      // PAYE row
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text('PAYE (Income Tax)', 50, y);

      doc.fillColor(COLORS.error)
        .fontSize(10)
        .text(`- ${fmt(payslip.paye_amount)}`, 450, y, { width: 80, align: 'right' });

      y += 18;
      doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
      y += 8;

      // Other deduction rows
      deductionBreakdown.forEach(d => {
        doc.fillColor(COLORS.text)
          .fontSize(10)
          .font('Helvetica')
          .text(d.name, 50, y);

        doc.fillColor(COLORS.error)
          .fontSize(10)
          .text(`- ${fmt(d.amount)}`, 450, y, { width: 80, align: 'right' });

        y += 18;
        doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        y += 8;
      });

      // Total deductions row
      doc.rect(40, y, pageWidth, 22).fill(COLORS.light);
      doc.fillColor(COLORS.error)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Total Deductions', 50, y + 6)
        .text(`- ${fmt(payslip.total_deductions)}`, 450, y + 6, { width: 80, align: 'right' });

      y += 30;

      // ── Net Pay Box ───────────────────────────────────────────────────────
      doc.rect(40, y, pageWidth, 50).fill('#F0FFF4');
      doc.rect(40, y, pageWidth, 50).strokeColor('#9AE6B4').lineWidth(1).stroke();

      doc.fillColor(COLORS.text)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('NET PAY', 50, y + 15);

      doc.fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text(`Paid to ${employee.bank_name || '—'} ****${(employee.bank_account_number || '').slice(-4)}`, 50, y + 32);

      doc.fillColor(COLORS.success)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(fmt(payslip.net_pay), 450, y + 12, { width: 80, align: 'right' });

      y += 60;

      // ── Tax Summary ───────────────────────────────────────────────────────
      doc.rect(40, y, pageWidth, 35).fill(COLORS.light);

      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('TAX SUMMARY', 50, y + 6);

      const taxItems = [
        { label: 'Gross Taxable Income', value: fmt(payslip.gross_taxable_income) },
        { label: 'PAYE Withheld', value: fmt(payslip.paye_amount) },
        { label: 'Effective Tax Rate', value: `${payslip.effective_tax_rate || 0}%` },
      ];

      taxItems.forEach((item, i) => {
        doc.fillColor(COLORS.muted)
          .fontSize(8)
          .font('Helvetica')
          .text(`${item.label}: `, 50 + (i * 160), y + 18, { continued: true })
          .fillColor(COLORS.text)
          .font('Helvetica-Bold')
          .text(item.value);
      });

      y += 45;

      // ── Footer ────────────────────────────────────────────────────────────
      doc.moveTo(40, y).lineTo(40 + pageWidth, y).strokeColor(COLORS.border).lineWidth(1).stroke();
      y += 8;

      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica')
        .text('This payslip is generated by Botsfirm PaySphere. BURS compliant. Employment Act 2010.', 40, y, { align: 'center', width: pageWidth });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePayslipPDF };