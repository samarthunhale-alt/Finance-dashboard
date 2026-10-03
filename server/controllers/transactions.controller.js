import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';
import { round2 } from '../utils/dates.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (v) => v !== undefined && v !== null && v !== '';

async function assertCategoryUsable(userId, categoryId, type) {
  const category = await Category.findOne({ _id: categoryId, $or: [{ user: null }, { user: userId }] });
  if (!category) throw ApiError.badRequest('Category not found');
  if (category.type !== 'both' && category.type !== type) {
    throw ApiError.badRequest(`Category "${category.name}" cannot be used for ${type} transactions`);
  }
  return category;
}

async function buildFilter(userId, q) {
  const filter = { user: userId };
  if (q.type) filter.type = q.type;
  if (q.category) filter.category = new mongoose.Types.ObjectId(q.category);
  if (q.startDate || q.endDate) {
    filter.date = {};
    if (q.startDate) filter.date.$gte = new Date(q.startDate);
    if (q.endDate) {
      const end = new Date(q.endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  if (has(q.minAmount) || has(q.maxAmount)) {
    filter.amount = {};
    if (has(q.minAmount)) filter.amount.$gte = Number(q.minAmount);
    if (has(q.maxAmount)) filter.amount.$lte = Number(q.maxAmount);
  }
  if (q.q && String(q.q).trim()) {
    const rx = new RegExp(escapeRegex(String(q.q).trim()), 'i');
    const cats = await Category.find({ name: rx, $or: [{ user: null }, { user: userId }] }).select('_id');
    filter.$or = [{ description: rx }, { category: { $in: cats.map((c) => c._id) } }];
  }
  return filter;
}

export const listTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const sortBy = ['date', 'amount', 'createdAt'].includes(req.query.sortBy) ? req.query.sortBy : 'date';
  const dir = req.query.order === 'asc' ? 1 : -1;
  const filter = await buildFilter(req.user._id, req.query);

  const [items, total, sums] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name type')
      .sort({ [sortBy]: dir, _id: dir })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([{ $match: filter }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);
  const summary = { income: 0, expense: 0 };
  sums.forEach((s) => { summary[s._id] = round2(s.total); });

  res.json({
    success: true,
    data: items,
    summary,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const getTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name type');
  if (!tx) throw ApiError.notFound('Transaction not found');
  res.json({ success: true, data: tx });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  await assertCategoryUsable(req.user._id, category, type);
  const tx = await Transaction.create({ user: req.user._id, type, amount, category, description, date });
  await tx.populate('category', 'name type');
  logActivity(req.user._id, 'transaction.create', { type, amount });
  res.status(201).json({ success: true, data: tx });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) throw ApiError.notFound('Transaction not found');

  const next = {
    type: req.body.type ?? tx.type,
    category: req.body.category ?? tx.category,
  };
  if (req.body.type !== undefined || req.body.category !== undefined) {
    await assertCategoryUsable(req.user._id, next.category, next.type);
  }
  ['type', 'amount', 'category', 'description', 'date'].forEach((field) => {
    if (req.body[field] !== undefined) tx[field] = req.body[field];
  });
  await tx.save();
  await tx.populate('category', 'name type');
  logActivity(req.user._id, 'transaction.update', { id: tx._id });
  res.json({ success: true, data: tx });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!tx) throw ApiError.notFound('Transaction not found');
  logActivity(req.user._id, 'transaction.delete', { id: tx._id });
  res.json({ success: true, message: 'Transaction deleted' });
});
