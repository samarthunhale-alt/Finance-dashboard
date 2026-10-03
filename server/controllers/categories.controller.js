import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const visibleTo = (userId) => ({ $or: [{ user: null }, { user: userId }] });

export const listCategories = asyncHandler(async (req, res) => {
  const filter = visibleTo(req.user._id);
  if (req.query.type) {
    filter.type = { $in: [req.query.type, 'both'] };
  }
  const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, type = 'both' } = req.body;
  const nameKey = name.trim().toLowerCase();
  const clash = await Category.exists({ nameKey, ...visibleTo(req.user._id) });
  if (clash) throw ApiError.conflict(`A category named "${name}" already exists`);
  const category = await Category.create({ name, type, user: req.user._id });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (category.isDefault || String(category.user) !== String(req.user._id)) {
    throw ApiError.forbidden('Built-in categories cannot be changed');
  }
  if (req.body.name !== undefined) {
    const nameKey = req.body.name.trim().toLowerCase();
    const clash = await Category.exists({ nameKey, _id: { $ne: category._id }, ...visibleTo(req.user._id) });
    if (clash) throw ApiError.conflict(`A category named "${req.body.name}" already exists`);
    category.name = req.body.name;
  }
  if (req.body.type !== undefined) category.type = req.body.type;
  await category.save();
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (category.isDefault || String(category.user) !== String(req.user._id)) {
    throw ApiError.forbidden('Built-in categories cannot be deleted');
  }
  const [txCount, budgetCount] = await Promise.all([
    Transaction.countDocuments({ user: req.user._id, category: category._id }),
    Budget.countDocuments({ user: req.user._id, 'categoryBudgets.category': category._id }),
  ]);
  if (txCount || budgetCount) {
    throw ApiError.conflict(`Category is in use by ${txCount} transaction(s) and ${budgetCount} budget(s). Reassign them first.`);
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
