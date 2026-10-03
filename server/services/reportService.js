import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import SavingsGoal from '../models/SavingsGoal.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { currentMonth, lastNMonths, monthRange, round2 } from '../utils/dates.js';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

async function totalsByType(match) {
  const rows = await Transaction.aggregate([{ $match: match }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]);
  const out = { income: 0, expense: 0 };
  rows.forEach((r) => { out[r._id] = round2(r.total); });
  return out;
}

export async function monthlySeries(userId, n = 6) {
  const months = lastNMonths(n);
  const { start } = monthRange(months[0]);
  const { end } = monthRange(months[months.length - 1]);
  const rows = await Transaction.aggregate([
    { $match: { user: oid(userId), date: { $gte: start, $lt: end } } },
    { $group: { _id: { m: { $dateToString: { format: '%Y-%m', date: '$date' } }, t: '$type' }, total: { $sum: '$amount' } } },
  ]);
  const lookup = new Map(rows.map((r) => [`${r._id.m}|${r._id.t}`, r.total]));
  return months.map((month) => {
    const income = round2(lookup.get(`${month}|income`) || 0);
    const expense = round2(lookup.get(`${month}|expense`) || 0);
    return { month, income, expense, savings: round2(income - expense) };
  });
}

export async function expenseByCategory(userId, month = currentMonth()) {
  const { start, end } = monthRange(month);
  const rows = await Transaction.aggregate([
    { $match: { user: oid(userId), type: 'expense', date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, categoryId: '$_id', name: { $ifNull: ['$cat.name', 'Uncategorized'] }, total: 1, count: 1 } },
    { $sort: { total: -1 } },
  ]);
  return rows.map((r) => ({ ...r, total: round2(r.total) }));
}

export async function savingsTrend(userId, n = 6) {
  const series = await monthlySeries(userId, n);
  let running = 0;
  return series.map((s) => {
    running = round2(running + s.savings);
    return { month: s.month, savings: s.savings, cumulative: running };
  });
}

export async function dashboard(userId) {
  const month = currentMonth();
  const { start, end } = monthRange(month);
  const [all, monthly, recent, categories, series, goals] = await Promise.all([
    totalsByType({ user: oid(userId) }),
    totalsByType({ user: oid(userId), date: { $gte: start, $lt: end } }),
    Transaction.find({ user: userId }).populate('category', 'name type').sort({ date: -1, _id: -1 }).limit(6),
    expenseByCategory(userId, month),
    monthlySeries(userId, 6),
    SavingsGoal.aggregate([{ $match: { user: oid(userId) } }, { $group: { _id: null, saved: { $sum: '$currentAmount' }, target: { $sum: '$targetAmount' } } }]),
  ]);
  return {
    totals: { income: all.income, expense: all.expense, balance: round2(all.income - all.expense) },
    month: { key: month, income: monthly.income, expense: monthly.expense, savings: round2(monthly.income - monthly.expense) },
    goals: { saved: round2(goals[0]?.saved || 0), target: round2(goals[0]?.target || 0) },
    recentTransactions: recent,
    expenseByCategory: categories,
    incomeVsExpense: series,
  };
}

const ACTIVE_WINDOW_DAYS = 30;

export async function adminOverview() {
  const since = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const monthStart = monthRange(currentMonth()).start;
  const [totalUsers, activeUsers, deactivated, admins, newThisMonth, txCount, totals, recentActivity] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: since }, isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ createdAt: { $gte: monthStart } }),
    Transaction.countDocuments(),
    totalsByType({}),
    Activity.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
  ]);
  return {
    users: { total: totalUsers, active: activeUsers, deactivated, admins, newThisMonth, activeWindowDays: ACTIVE_WINDOW_DAYS },
    transactions: { total: txCount, income: totals.income, expense: totals.expense },
    recentActivity,
  };
}

export async function adminMonthly(n = 6) {
  const months = lastNMonths(n);
  const { start } = monthRange(months[0]);
  const { end } = monthRange(months[months.length - 1]);
  const [tx, signups, topCategories] = await Promise.all([
    Transaction.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { m: { $dateToString: { format: '%Y-%m', date: '$date' } }, t: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, name: { $ifNull: ['$cat.name', 'Uncategorized'] }, total: 1, count: 1 } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
  ]);
  const get = (m, t, f) => tx.find((r) => r._id.m === m && r._id.t === t)?.[f] || 0;
  const signupMap = new Map(signups.map((s) => [s._id, s.count]));
  return {
    monthly: months.map((month) => ({
      month,
      income: round2(get(month, 'income', 'total')),
      expense: round2(get(month, 'expense', 'total')),
      transactions: get(month, 'income', 'count') + get(month, 'expense', 'count'),
      signups: signupMap.get(month) || 0,
    })),
    topCategories: topCategories.map((c) => ({ ...c, total: round2(c.total) })),
  };
}
