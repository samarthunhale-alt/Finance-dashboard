import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [30, 'Category name must be at most 30 characters'],
    },
    nameKey: { type: String, required: true, index: true },
    type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
    // null user = built-in category shared by everyone
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function setKey(next) {
  if (this.name) this.nameKey = this.name.trim().toLowerCase();
  next();
});

categorySchema.index({ user: 1, nameKey: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
