import api from './client';

export const financeApi = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard: (month?: number, year?: number) =>
    api.get('/super-admin/finance/dashboard', { params: { month, year } }).then(r => r.data),

  // ── Expense Categories ────────────────────────────────────────────────────
  getCategories: () =>
    api.get('/super-admin/finance/categories').then(r => r.data),
  createCategory: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/categories', data).then(r => r.data),
  updateCategory: (id: number, data: Record<string, unknown>) =>
    api.put(`/super-admin/finance/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id: number) =>
    api.delete(`/super-admin/finance/categories/${id}`).then(r => r.data),

  // ── Expenses ──────────────────────────────────────────────────────────────
  getExpenses: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/expenses', { params }).then(r => r.data),
  createExpense: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/expenses', data).then(r => r.data),
  updateExpense: (id: number, data: Record<string, unknown>) =>
    api.put(`/super-admin/finance/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: number) =>
    api.delete(`/super-admin/finance/expenses/${id}`).then(r => r.data),
  uploadReceipt: (id: number, file: File) => {
    const fd = new FormData(); fd.append('receipt', file);
    return api.post(`/super-admin/finance/expenses/${id}/upload-receipt`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getDailyExpenses: (date: string) =>
    api.get(`/super-admin/finance/expenses/daily/${date}`).then(r => r.data),
  getMonthlyExpenses: (month: number, year: number) =>
    api.get(`/super-admin/finance/expenses/monthly/${month}/${year}`).then(r => r.data),
  getRecurringExpenses: () =>
    api.get('/super-admin/finance/expenses/recurring').then(r => r.data),

  // ── Employees ─────────────────────────────────────────────────────────────
  getEmployees: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/employees', { params }).then(r => r.data),
  createEmployee: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/employees', data).then(r => r.data),
  updateEmployee: (id: number, data: Record<string, unknown>) =>
    api.put(`/super-admin/finance/employees/${id}`, data).then(r => r.data),
  deleteEmployee: (id: number) =>
    api.delete(`/super-admin/finance/employees/${id}`).then(r => r.data),
  getEmployeeSalaryHistory: (id: number) =>
    api.get(`/super-admin/finance/employees/${id}/salary-history`).then(r => r.data),
  toggleEmployeeActive: (id: number) =>
    api.post(`/super-admin/finance/employees/${id}/toggle-active`).then(r => r.data),
  getEmployeeRevisions: (id: number) =>
    api.get(`/super-admin/finance/employees/${id}/revisions`).then(r => r.data),
  addEmployeeRevision: (id: number, data: Record<string, unknown>) =>
    api.post(`/super-admin/finance/employees/${id}/revisions`, data).then(r => r.data),

  // ── Payroll ───────────────────────────────────────────────────────────────
  getPayrollCycle: (month: number, year: number) =>
    api.get(`/super-admin/finance/payroll/cycle/${month}/${year}`).then(r => r.data),
  generatePayroll: (month: number, year: number) =>
    api.post(`/super-admin/finance/payroll/generate/${month}/${year}`).then(r => r.data),
  markPayoutPaid: (payoutId: number, data: Record<string, unknown>) =>
    api.put(`/super-admin/finance/payroll/${payoutId}/mark-paid`, data).then(r => r.data),
  updatePayoutStatus: (payoutId: number, status: string) =>
    api.put(`/super-admin/finance/payroll/${payoutId}/status`, { status }).then(r => r.data),
  uploadPayoutProof: (payoutId: number, file: File) => {
    const fd = new FormData(); fd.append('proof', file);
    return api.post(`/super-admin/finance/payroll/${payoutId}/upload-proof`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getPayrollAnnualSummary: (year: number) =>
    api.get(`/super-admin/finance/payroll/summary/${year}`).then(r => r.data),

  // ── Revenue & MRR (Phase 2) ────────────────────────────────────────────────
  getRevenueCompanies: () =>
    api.get('/super-admin/finance/revenue/companies').then(r => r.data),
  getMrrBreakdown: () =>
    api.get('/super-admin/finance/revenue/mrr').then(r => r.data),
  getMrrHistory: () =>
    api.get('/super-admin/finance/revenue/mrr/history').then(r => r.data),
  getSubscriptions: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/revenue/subscriptions', { params }).then(r => r.data),
  manualRenewal: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/revenue/renewals', data).then(r => r.data),
  getRevenueAdjustments: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/revenue/adjustments', { params }).then(r => r.data),
  createRevenueAdjustment: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/revenue/adjustments', data).then(r => r.data),
  getRevenueTarget: (month: number, year: number) =>
    api.get(`/super-admin/finance/revenue/targets/${month}/${year}`).then(r => r.data),
  setRevenueTarget: (data: Record<string, unknown>) =>
    api.post('/super-admin/finance/revenue/targets', data).then(r => r.data),
  getUpgradeLog: (month?: number, year?: number) =>
    api.get('/super-admin/finance/revenue/upgrade-log', { params: { month, year } }).then(r => r.data),

  // ── Churn Tracking (Phase 2) ──────────────────────────────────────────────
  getChurnLog: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/churn', { params }).then(r => r.data),
  tagChurnReason: (id: number, data: Record<string, unknown>) =>
    api.post(`/super-admin/finance/churn/${id}/reason`, data).then(r => r.data),
  detectChurn: () =>
    api.post('/super-admin/finance/churn/detect').then(r => r.data),

  // ── Plans & Pricing (Phase 2) ─────────────────────────────────────────────
  getPlans: () =>
    api.get('/super-admin/finance/plans').then(r => r.data),
  updatePlanPricing: (data: Record<string, unknown>) =>
    api.put('/super-admin/finance/plans/pricing', data).then(r => r.data),
  getPlanPricingHistory: (params?: Record<string, unknown>) =>
    api.get('/super-admin/finance/plans/pricing/history', { params }).then(r => r.data),

  // ── Reports (Phase 2) ─────────────────────────────────────────────────────
  getMonthlyPlReport: (month: number, year: number) =>
    api.get(`/super-admin/finance/reports/pl/${month}/${year}`).then(r => r.data),
  getAnnualReport: (year: number) =>
    api.get(`/super-admin/finance/reports/annual/${year}`).then(r => r.data),
  getPayrollReport: (year: number) =>
    api.get(`/super-admin/finance/reports/payroll/${year}`).then(r => r.data),
  getGstReport: (month: number, year: number) =>
    api.get(`/super-admin/finance/reports/gst/${month}/${year}`).then(r => r.data),
};

// Google Integration API
