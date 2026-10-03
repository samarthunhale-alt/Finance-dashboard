import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: [true, 'Type is required'] },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      max: [1000000000, 'Amount is too large'],
      set: (v) => Math.round(Number(v) * 100) / 100,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    description: { type: String, trim: true, maxlength: [200, 'Description must be at most 200 characters'], default: '' },
    date: { type: Date, required: [true, 'Date is required'], default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
