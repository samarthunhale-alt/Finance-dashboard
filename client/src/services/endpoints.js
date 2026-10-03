import api from './api.js';

const body = (promise) => promise.then((res) => res.data);

export const authApi = {
  register: (payload) => body(api.post('/auth/register', payload)),
  login: (payload) => body(api.post('/auth/login', payload)),
  logout: () => body(api.post('/auth/logout')),
  me: () => body(api.get('/auth/me')),
};

export const usersApi = {
  updateMe: (payload) => body(api.patch('/users/me', payload)),
  changePassword: (payload) => body(api.patch('/users/me/password', payload)),
  list: (params) => body(api.get('/users', { params })),
  update: (id, payload) => body(api.patch(`/users/${id}`, payload)),
  remove: (id) => body(api.delete(`/users/${id}`)),
  activity: (params) => body(api.get('/users/activity', { params })),
};

export const transactionsApi = {
  list: (params) => body(api.get('/transactions', { params })),
  create: (payload) => body(api.post('/transactions', payload)),
  update: (id, payload) => body(api.put(`/transactions/${id}`, payload)),
  remove: (id) => body(api.delete(`/transactions/${id}`)),
};

export const categoriesApi = {
  list: (params) => body(api.get('/categories', { params })),
  create: (payload) => body(api.post('/categories', payload)),
  remove: (id) => body(api.delete(`/categories/${id}`)),
};

export const budgetsApi = {
  list: (params) => body(api.get('/budgets', { params })),
  create: (payload) => body(api.post('/budgets', payload)),
  update: (id, payload) => body(api.put(`/budgets/${id}`, payload)),
  remove: (id) => body(api.delete(`/budgets/${id}`)),
};

export const savingsApi = {
  list: () => body(api.get('/savings')),
  summary: () => body(api.get('/savings/summary')),
  create: (payload) => body(api.post('/savings', payload)),
  update: (id, payload) => body(api.put(`/savings/${id}`, payload)),
  contribute: (id, amount) => body(api.post(`/savings/${id}/contribute`, { amount })),
  remove: (id) => body(api.delete(`/savings/${id}`)),
};

export const reportsApi = {
  dashboard: () => body(api.get('/reports/dashboard')),
  incomeExpense: (months = 6) => body(api.get('/reports/income-expense', { params: { months } })),
  expenseByCategory: (month) => body(api.get('/reports/expense-by-category', { params: { month } })),
  monthlySpending: (months = 6) => body(api.get('/reports/monthly-spending', { params: { months } })),
  savingsTrend: (months = 6) => body(api.get('/reports/savings-trend', { params: { months } })),
  budgetUtilization: (month) => body(api.get('/reports/budget-utilization', { params: { month } })),
  adminOverview: () => body(api.get('/reports/admin/overview')),
  adminMonthly: (months = 6) => body(api.get('/reports/admin/monthly', { params: { months } })),
};
