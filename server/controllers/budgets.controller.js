import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';
import { withUsage } from '../services/budgetService.js';

async function assertCategoryBudgets(userId, categoryBudgets = []) {
  const ids = categoryBudgets.map((c) => String(c.category));
  if (new Set(ids).size !== ids.length) throw ApiError.badRequest('Each category can only appear once in a budget');
  if (!ids.length) return;
  const found = await Category.find({ _id: { $in: ids }, type: { $in: ['expense', 'both'] }, $or: [{ user: null }, { user: userId }] }).select('_id');
  if (found.length !== ids.length) throw ApiError.badRequest('One or more budget categories are invalid or not expense categories');
}

const load = (query) => query.populate('categoryBudgets.category', 'name');

export const listBudgets = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.month) filter.month = req.query.month;
  const budgets = await load(Budget.find(filter).sort({ month: -1 }).limit(24));
  const data = await Promise.all(budgets.map((b) => withUsage(req.user._id, b)));
  res.json({ success: true, data });
});

export const getBudget = asyncHandler(async (req, res) => {
  const budget = await load(Budget.findOne({ _id: req.params.id, user: req.user._id }));
  if (!budget) throw ApiError.notFound('Budget not found');
  res.json({ success: true, data: await withUsage(req.user._id, budget) });
});

export const createBudget = asyncHandler(async (req, res) => {
  const { month, totalAmount, categoryBudgets = [] } = req.body;
  if (await Budget.exists({ user: req.user._id, month })) throw ApiError.conflict(`A budget for ${month} already exists`);
  await assertCategoryBudgets(req.user._id, categoryBudgets);
  const created = await Budget.create({ user: req.user._id, month, totalAmount, categoryBudgets });
  const budget = await load(Budget.findById(created._id));
  logActivity(req.user._id, 'budget.create', { month });
  res.status(201).json({ success: true, data: await withUsage(req.user._id, budget) });
});

export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) throw ApiError.notFound('Budget not found');
  if (req.body.categoryBudgets !== undefined) {
    await assertCategoryBudgets(req.user._id, req.body.categoryBudgets);
    budget.categoryBudgets = req.body.categoryBudgets;
  }
  if (req.body.totalAmount !== undefined) budget.totalAmount = req.body.totalAmount;
  await budget.save();
  const fresh = await load(Budget.findById(budget._id));
  logActivity(req.user._id, 'budget.update', { month: budget.month });
  res.json({ success: true, data: await withUsage(req.user._id, fresh) });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) throw ApiError.notFound('Budget not found');
  logActivity(req.user._id, 'budget.delete', { month: budget.month });
  res.json({ success: true, message: 'Budget deleted' });
});
