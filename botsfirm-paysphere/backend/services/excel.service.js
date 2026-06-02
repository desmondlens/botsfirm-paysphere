// excel.service.js
// Excel export generator using ExcelJS.
//
// Produces: payroll register, leave register, allowance/deduction summary,
// BURS submission workbooks (ITW-7, ITW-10, ITW-8).
// Honors trial locks for BURS sheets.
/**
 * Botsfirm PaySphere — Excel Service
 * Generates QuickBooks-compatible journal entry Excel files
 */

'use strict';

const ExcelJS = require('exceljs');

/**
 * Generate QuickBooks journal entry Excel file
 * @param {object} journalData - Journal entries from payroll service
 * @param {object} tenant - Company record
 * @param {object} payPeriod - { month, year }
 * @returns {Promise<Buffer>} Excel file as buffer
 */
const generateQuickBooksExcel = async (journalData, tenant, payPeriod) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Botsfirm PaySphere';
  workbook.created = new Date();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const periodLabel = `${monthNames[(payPeriod.month || 1) - 1]} ${payPeriod.year}`;

  // ── Journal Entry Sheet ───────────────────────────────────────────────────
  const sheet = workbook.addWorksheet('Journal Entry', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Column widths
  sheet.columns = [
    { key: 'date', width: 15 },
    { key: 'journal_no', width: 18 },
    { key: 'account', width: 35 },
    { key: 'description', width: 40 },
    { key: 'debit', width: 18 },
    { key: 'credit', width: 18 },
    { key: 'reference', width: 20 },
  ];

  // ── Header Section ────────────────────────────────────────────────────────
  sheet.mergeCells('A1:G1');
  sheet.getCell('A1').value = 'BOTSFIRM PAYSPHERE — QUICKBOOKS JOURNAL ENTRY EXPORT';
  sheet.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FF2B6CB0' } };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:G2');
  sheet.getCell('A2').value = `${tenant?.company_name || 'Company'} · Payroll Journal · ${periodLabel}`;
  sheet.getCell('A2').font = { size: 11, color: { argb: 'FF718096' } };
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  sheet.mergeCells('A3:G3');
  sheet.getCell('A3').value = `BURS Number: ${tenant?.burs_number || '—'} · Generated: ${new Date().toLocaleDateString('en-BW')}`;
  sheet.getCell('A3').font = { size: 9, color: { argb: 'FF718096' } };
  sheet.getCell('A3').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  // ── Column Headers ────────────────────────────────────────────────────────
  const headerRow = sheet.addRow(['Date', 'Journal No.', 'Account', 'Description', 'Debit (BWP)', 'Credit (BWP)', 'Reference']);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B6CB0' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  headerRow.height = 22;

  // ── Journal Entry Rows ────────────────────────────────────────────────────
  const journalNo = `JE-${payPeriod.year}-${String(payPeriod.month).padStart(2, '0')}-001`;
  const payDate = journalData.entries[0]?.date || new Date().toLocaleDateString('en-BW');

  const rowColors = ['FFFAFAFA', 'FFFFFFFF'];

  journalData.entries.forEach((entry, i) => {
    const row = sheet.addRow([
      payDate,
      journalNo,
      entry.account,
      entry.description,
      entry.debit > 0 ? entry.debit : '',
      entry.credit > 0 ? entry.credit : '',
      `PAY-${payPeriod.year}-${String(payPeriod.month).padStart(2, '0')}`,
    ]);

    row.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColors[i % 2] } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Format debit/credit columns as currency
      if (colNumber === 5 || colNumber === 6) {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
        cell.font = {
          color: { argb: colNumber === 5 ? 'FF2B6CB0' : 'FF38A169' },
          bold: true,
        };
      }
    });

    row.height = 20;
  });

  // ── Totals Row ────────────────────────────────────────────────────────────
  sheet.addRow([]);

  const totalsRow = sheet.addRow([
    '',
    '',
    'TOTALS',
    '',
    journalData.total_debits,
    journalData.total_credits,
    '',
  ]);

  totalsRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7FAFC' } };
    cell.border = {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
    };
    if (colNumber === 5) {
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, color: { argb: 'FF2B6CB0' } };
    }
    if (colNumber === 6) {
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, color: { argb: 'FF38A169' } };
    }
  });

  totalsRow.height = 22;

  // ── Balance Check ─────────────────────────────────────────────────────────
  sheet.addRow([]);
  const balanceRow = sheet.addRow([
    '',
    '',
    journalData.balanced ? '✓ Journal is balanced — Debits equal Credits' : '⚠ WARNING: Journal is NOT balanced',
    '',
    '',
    '',
    '',
  ]);

  sheet.mergeCells(`C${balanceRow.number}:G${balanceRow.number}`);
  balanceRow.getCell(3).font = {
    bold: true,
    color: { argb: journalData.balanced ? 'FF38A169' : 'FFE53E3E' },
  };

  // ── Summary Sheet ─────────────────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Payroll Summary');

  summarySheet.columns = [
    { key: 'label', width: 35 },
    { key: 'value', width: 25 },
  ];

  const summaryTitle = summarySheet.addRow(['PAYROLL SUMMARY', '']);
  summarySheet.mergeCells('A1:B1');
  summaryTitle.getCell(1).font = { bold: true, size: 13, color: { argb: 'FF2B6CB0' } };

  summarySheet.addRow([periodLabel, '']);
  summarySheet.addRow([]);

  const summaryHeader = summarySheet.addRow(['Item', 'Amount (BWP)']);
  summaryHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B6CB0' } };
    cell.alignment = { horizontal: 'center' };
  });

  const summaryData = [
    ['Company', tenant?.company_name || '—'],
    ['BURS Number', tenant?.burs_number || '—'],
    ['Pay Period', periodLabel],
    ['', ''],
    ['Total Gross Pay', journalData.entries.find(e => e.account === 'Salaries & Wages Expense')?.debit || 0],
    ['Total PAYE Withheld', journalData.entries.find(e => e.account === 'PAYE Payable')?.credit || 0],
    ['Total Other Deductions', journalData.entries.find(e => e.account === 'Other Deductions Payable')?.credit || 0],
    ['Total Net Pay', journalData.entries.find(e => e.account === 'Net Salaries Payable')?.credit || 0],
  ];

  summaryData.forEach((item, i) => {
    const row = summarySheet.addRow(item);
    if (typeof item[1] === 'number') {
      row.getCell(2).numFmt = '#,##0.00';
      row.getCell(2).alignment = { horizontal: 'right' };
      row.getCell(2).font = { bold: true, color: { argb: 'FF2B6CB0' } };
    }
    row.getCell(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: i % 2 === 0 ? 'FFFAFAFA' : 'FFFFFFFF' },
    };
  });

  // ── Instructions Sheet ────────────────────────────────────────────────────
  const instructSheet = workbook.addWorksheet('QuickBooks Import Guide');

  instructSheet.getColumn(1).width = 80;

  const instructions = [
    ['QUICKBOOKS IMPORT INSTRUCTIONS'],
    [''],
    ['HOW TO IMPORT THIS JOURNAL INTO QUICKBOOKS:'],
    [''],
    ['1. Open QuickBooks'],
    ['2. Go to Company → Make General Journal Entries'],
    ['3. Set the Date to the payroll pay date'],
    ['4. Enter the Journal No. from the Journal Entry sheet'],
    ['5. For each row in the Journal Entry sheet:'],
    ['   - Select the Account from your Chart of Accounts'],
    ['   - Enter the Description'],
    ['   - Enter the Debit amount (if applicable)'],
    ['   - Enter the Credit amount (if applicable)'],
    ['6. Verify the journal balances (Debits = Credits)'],
    ['7. Click Save & Close'],
    [''],
    ['ACCOUNTS TO CREATE IN QUICKBOOKS (if not existing):'],
    [''],
    ['- Salaries & Wages Expense (Expense account)'],
    ['- PAYE Payable (Current Liability account)'],
    ['- Other Deductions Payable (Current Liability account)'],
    ['- Net Salaries Payable (Current Liability account)'],
    [''],
    ['NOTE: This export is generated by Botsfirm PaySphere.'],
    ['For support contact: info@botsfirmpaysphere.com'],
  ];

  instructions.forEach((row, i) => {
    const excelRow = instructSheet.addRow(row);
    if (i === 0) {
      excelRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF2B6CB0' } };
    } else if (row[0]?.startsWith('HOW') || row[0]?.startsWith('ACCOUNTS')) {
      excelRow.getCell(1).font = { bold: true, size: 11 };
    } else {
      excelRow.getCell(1).font = { size: 10 };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Generate ITW-7 Excel report
 * @param {object} reportData - ITW-7 data from reports route
 * @param {object} tenant - Company record
 * @returns {Promise<Buffer>} Excel file as buffer
 */
const generateITW7Excel = async (reportData, tenant) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Botsfirm PaySphere';

  const sheet = workbook.addWorksheet('ITW-7 Return');

  sheet.columns = [
    { key: 'name', width: 30 },
    { key: 'tin', width: 20 },
    { key: 'nationality', width: 20 },
    { key: 'gross', width: 20 },
    { key: 'paye', width: 20 },
  ];

  // Title
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'BOTSWANA UNIFIED REVENUE SERVICE — ITW-7 MONTHLY PAYE RETURN';
  sheet.getCell('A1').font = { bold: true, size: 12 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  // Company info
  sheet.addRow(['Employer Name:', tenant?.company_name || '—']);
  sheet.addRow(['BURS Reference:', tenant?.burs_number || '—']);
  sheet.addRow(['Tax Period:', `${reportData.period?.month}/${reportData.period?.year}`]);
  sheet.addRow(['Due Date:', reportData.due_date]);

  sheet.addRow([]);

  // Employee header
  const header = sheet.addRow(['Employee Name', 'TIN', 'Nationality', 'Gross Income (BWP)', 'PAYE Withheld (BWP)']);
  header.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B6CB0' } };
    cell.alignment = { horizontal: 'center' };
  });

  // Employee rows
  (reportData.employees || []).forEach(emp => {
    const row = sheet.addRow([
      emp.full_name,
      emp.burs_tin,
      emp.nationality,
      emp.gross_income,
      emp.paye_withheld,
    ]);
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(4).alignment = { horizontal: 'right' };
    row.getCell(5).alignment = { horizontal: 'right' };
  });

  sheet.addRow([]);

  // Totals
  const totalsRow = sheet.addRow([
    'TOTAL PAYE PAYABLE TO BURS',
    '',
    '',
    reportData.totals?.total_gross || 0,
    reportData.totals?.total_paye || 0,
  ]);

  totalsRow.eachCell((cell, col) => {
    cell.font = { bold: true };
    if (col === 4 || col === 5) {
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, color: { argb: col === 5 ? 'FFE53E3E' : 'FF2B6CB0' } };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  generateQuickBooksExcel,
  generateITW7Excel,
};
