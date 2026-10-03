import { asyncHandler } from '../utils/asyncHandler.js';
import { currentMonth } from '../utils/dates.js';
import Budget from '../models/Budget.js';
import { withUsage } from '../services/budgetService.js';
import * as reports from '../services/reportService.js';

const monthsParam = (req, fallback = 6) => Math.min(24, Math.max(1, parseInt(req.query.months, 10) || fallback));

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.dashboard(req.user._id) });
});

export const getIncomeExpense = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.monthlySeries(req.user._id, monthsParam(req)) });
});

export const getExpenseByCategory = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.expenseByCategory(req.user._id, req.query.month || currentMonth()) });
});

export const getMonthlySpending = asyncHandler(async (req, res) => {
  const series = await reports.monthlySeries(req.user._id, monthsParam(req));
  res.json({ success: true, data: series.map((s) => ({ month: s.month, spending: s.expense })) });
});

export const getSavingsTrend = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.savingsTrend(req.user._id, monthsParam(req)) });
});

export const getBudgetUtilization = asyncHandler(async (req, res) => {
  const month = req.query.month || currentMonth();
  const budget = await Budget.findOne({ user: req.user._id, month }).populate('categoryBudgets.category', 'name');
  if (!budget) return res.json({ success: true, data: null });
  const b = await withUsage(req.user._id, budget);
  return res.json({
    success: true,
    data: {
      month,
      totalAmount: b.totalAmount,
      ...b.usage,
      categories: b.usage.categories.map((c) => ({ ...c, name: c.category?.name || 'Unknown' })),
    },
  });
});

export const getAdminOverview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.adminOverview() });
});

export const getAdminMonthly = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reports.adminMonthly(monthsParam(req)) });
});
