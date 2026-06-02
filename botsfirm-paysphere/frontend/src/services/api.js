/**
 * Botsfirm PaySphere — Frontend API Service
 * Central file for all backend API calls.
 * All fetch calls go through here — no direct fetch in components.
 */

const API_BASE_URL = 'http://localhost:3002';

/**
 * Core fetch wrapper
 * Handles auth headers, JSON parsing and error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('paysphere_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (credentials) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiFetch('/api/auth/logout', {
    method: 'POST',
  }),

  me: () => apiFetch('/api/auth/me'),

  forgotPassword: (email) => apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token, password) => apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),

  changePassword: (currentPassword, newPassword) => apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  trialSignup: (data) => apiFetch('/api/auth/trial-signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  redeemInvite: (data) => apiFetch('/api/auth/redeem-invite', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ─── Employees ────────────────────────────────────────────────────────────────

export const employeesAPI = {
  getAll: () => apiFetch('/api/admin/employees'),

  getOne: (id) => apiFetch(`/api/admin/employees/${id}`),

  create: (data) => apiFetch('/api/admin/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiFetch(`/api/admin/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deactivate: (id) => apiFetch(`/api/admin/employees/${id}/deactivate`, {
    method: 'PUT',
  }),
};

// ─── Payroll ──────────────────────────────────────────────────────────────────

export const payrollAPI = {
  getCurrent: () => apiFetch('/api/payroll/current'),

  run: (payPeriod) => apiFetch('/api/payroll/run', {
    method: 'POST',
    body: JSON.stringify({ payPeriod }),
  }),

  approve: (payrollRunId) => apiFetch(`/api/payroll/${payrollRunId}/approve`, {
    method: 'PUT',
  }),

  markPaid: (payrollRunId) => apiFetch(`/api/payroll/${payrollRunId}/paid`, {
    method: 'PUT',
  }),

  getHistory: () => apiFetch('/api/payroll/history'),

  getPayslip: (payslipId) => apiFetch(`/api/payroll/payslips/${payslipId}`),

  getEmployeePayslips: () => apiFetch('/api/employee/payslips'),
};

// ─── Leave ────────────────────────────────────────────────────────────────────

export const leaveAPI = {
  getRequests: () => apiFetch('/api/admin/leave'),

  getMyRequests: () => apiFetch('/api/employee/leave'),

  apply: (data) => apiFetch('/api/employee/leave', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  approve: (leaveId, approvalPassword) => apiFetch(`/api/client/leave/${leaveId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approvalPassword }),
  }),

  reject: (leaveId, reason) => apiFetch(`/api/client/leave/${leaveId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),

  getBalances: () => apiFetch('/api/admin/leave/balances'),

  getMyBalances: () => apiFetch('/api/employee/leave/balances'),
};

// ─── Allowances ───────────────────────────────────────────────────────────────

export const allowancesAPI = {
  getTemplates: () => apiFetch('/api/admin/allowances'),

  create: (data) => apiFetch('/api/admin/allowances', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  toggle: (id) => apiFetch(`/api/admin/allowances/${id}/toggle`, {
    method: 'PUT',
  }),
};

// ─── Deductions ───────────────────────────────────────────────────────────────

export const deductionsAPI = {
  getTemplates: () => apiFetch('/api/admin/deductions'),

  create: (data) => apiFetch('/api/admin/deductions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  toggle: (id) => apiFetch(`/api/admin/deductions/${id}/toggle`, {
    method: 'PUT',
  }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsAPI = {
  getITW7: (month, year) => apiFetch(`/api/reports/itw7?month=${month}&year=${year}`),

  getITW10: (year) => apiFetch(`/api/reports/itw10?year=${year}`),

  getITW8: (employeeId) => apiFetch(`/api/reports/itw8/${employeeId}`),

  getQuickBooks: (month, year) => apiFetch(`/api/reports/quickbooks?month=${month}&year=${year}`),
};

// ─── Super Admin ──────────────────────────────────────────────────────────────

export const superAdminAPI = {
  getClients: () => apiFetch('/api/super-admin/clients'),

  getTrials: () => apiFetch('/api/super-admin/trials'),

  generateInviteCode: (data) => apiFetch('/api/super-admin/invite-codes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getInviteCodes: () => apiFetch('/api/super-admin/invite-codes'),

  getAuditLogs: (filters) => apiFetch(`/api/super-admin/audit-logs?${new URLSearchParams(filters)}`),

  suspendClient: (tenantId) => apiFetch(`/api/super-admin/clients/${tenantId}/suspend`, {
    method: 'PUT',
  }),

  activateClient: (tenantId) => apiFetch(`/api/super-admin/clients/${tenantId}/activate`, {
    method: 'PUT',
  }),

  convertTrial: (trialId, data) => apiFetch(`/api/super-admin/trials/${trialId}/convert`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ─── Client ───────────────────────────────────────────────────────────────────

export const clientAPI = {
  getDashboard: () => apiFetch('/api/client/dashboard'),

  getAdmins: () => apiFetch('/api/client/admins'),

  createAdmin: (data) => apiFetch('/api/client/admins', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  toggleAdmin: (userId) => apiFetch(`/api/client/admins/${userId}/toggle`, {
    method: 'PUT',
  }),

  getPayrollOverview: () => apiFetch('/api/client/payroll'),

  getCompliance: () => apiFetch('/api/client/compliance'),

  getAuditLogs: () => apiFetch('/api/client/audit-logs'),

  updateCompany: (data) => apiFetch('/api/client/settings/company', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ─── Employee ─────────────────────────────────────────────────────────────────

export const employeeAPI = {
  getProfile: () => apiFetch('/api/employee/profile'),

  getPayslip: () => apiFetch('/api/employee/payslip/current'),

  getPayslipHistory: () => apiFetch('/api/employee/payslip/history'),

  changePassword: (currentPassword, newPassword) => apiFetch('/api/employee/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
};