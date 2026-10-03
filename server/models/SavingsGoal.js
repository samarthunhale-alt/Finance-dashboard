import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Goal name is required'], trim: true, minlength: 2, maxlength: 60 },
    targetAmount: { type: Number, required: [true, 'Target amount is required'], min: [1, 'Target must be at least 1'] },
    currentAmount: { type: Number, default: 0, min: [0, 'Saved amount cannot be negative'] },
    deadline: Date,
    notes: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

savingsGoalSchema.virtual('progress').get(function progress() {
  if (!this.targetAmount) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 1000) / 10);
});

export default mongoose.model('SavingsGoal', savingsGoalSchema);
