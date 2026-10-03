import mongoose from 'mongoose';

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: [0.01, 'Category budget must be greater than 0'] },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    totalAmount: { type: Number, required: [true, 'Total budget is required'], min: [0.01, 'Total budget must be greater than 0'] },
    categoryBudgets: { type: [categoryBudgetSchema], default: [] },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
