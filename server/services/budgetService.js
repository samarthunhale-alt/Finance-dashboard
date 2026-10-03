import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { monthRange, round2 } from '../utils/dates.js';

const statusFor = (percent) => (percent >= 100 ? 'over' : percent >= 80 ? 'warning' : 'ok');

/** Attaches live spending figures to a budget document (category must be populated for names). */
export async function withUsage(userId, budget) {
  const { start, end } = monthRange(budget.month);
  const rows = await Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)), type: 'expense', date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);
  const spentBy = new Map(rows.map((r) => [String(r._id), r.spent]));
  const totalSpent = round2(rows.reduce((sum, r) => sum + r.spent, 0));

  const obj = budget.toObject();
  const percentUsed = Math.round((totalSpent / obj.totalAmount) * 1000) / 10;

  obj.usage = {
    totalSpent,
    remaining: round2(obj.totalAmount - totalSpent),
    percentUsed,
    status: statusFor(percentUsed),
    categories: obj.categoryBudgets.map((cb) => {
      const id = String(cb.category?._id || cb.category);
      const spent = round2(spentBy.get(id) || 0);
      const pct = Math.round((spent / cb.amount) * 1000) / 10;
      return {
        category: cb.category,
        budget: cb.amount,
        spent,
        remaining: round2(cb.amount - spent),
        percentUsed: pct,
        status: statusFor(pct),
      };
    }),
  };
  return obj;
}
