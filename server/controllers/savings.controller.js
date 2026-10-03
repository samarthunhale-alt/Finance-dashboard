import SavingsGoal from '../models/SavingsGoal.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';
import { currentMonth, monthRange, round2 } from '../utils/dates.js';

export const listGoals = asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: goals });
});

export const savingsSummary = asyncHandler(async (req, res) => {
  const { start, end } = monthRange(currentMonth());
  const [goals, monthRows] = await Promise.all([
    SavingsGoal.find({ user: req.user._id }),
    Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
  ]);
  const month = { income: 0, expense: 0 };
  monthRows.forEach((r) => { month[r._id] = r.total; });
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  res.json({
    success: true,
    data: {
      goalsCount: goals.length,
      completed: goals.filter((g) => g.currentAmount >= g.targetAmount).length,
      totalTarget: round2(totalTarget),
      totalSaved: round2(totalSaved),
      overallProgress: totalTarget ? Math.min(100, Math.round((totalSaved / totalTarget) * 1000) / 10) : 0,
      monthlySavings: round2(month.income - month.expense),
    },
  });
});

export const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, notes } = req.body;
  const goal = await SavingsGoal.create({ user: req.user._id, name, targetAmount, currentAmount, deadline, notes });
  logActivity(req.user._id, 'savings.create', { name });
  res.status(201).json({ success: true, data: goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  ['name', 'targetAmount', 'currentAmount', 'deadline', 'notes'].forEach((f) => {
    if (req.body[f] !== undefined) goal[f] = req.body[f];
  });
  await goal.save();
  res.json({ success: true, data: goal });
});

// Positive amount adds funds, negative amount withdraws.
export const contribute = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  const next = round2(goal.currentAmount + req.body.amount);
  if (next < 0) throw ApiError.badRequest('You cannot withdraw more than the amount saved');
  goal.currentAmount = next;
  await goal.save();
  logActivity(req.user._id, 'savings.contribute', { name: goal.name, amount: req.body.amount });
  res.json({ success: true, data: goal });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  res.json({ success: true, message: 'Savings goal deleted' });
});
