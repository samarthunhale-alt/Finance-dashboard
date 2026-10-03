import Category from '../models/Category.js';
import User from '../models/User.js';
import { env } from './env.js';

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense' },
  { name: 'Travel', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Bills', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Business', type: 'income' },
  { name: 'Other', type: 'both' },
];

export async function ensureDefaultCategories() {
  await Category.bulkWrite(
    DEFAULT_CATEGORIES.map((c) => ({
      updateOne: {
        filter: { user: null, nameKey: c.name.toLowerCase() },
        update: {
          $setOnInsert: { name: c.name, nameKey: c.name.toLowerCase(), type: c.type, isDefault: true, user: null },
        },
        upsert: true,
      },
    }))
  );
}

export async function ensureAdmin() {
  if (!env.adminEmail || !env.adminPassword) return;
  const existing = await User.findOne({ email: env.adminEmail });
  if (!existing) {
    await User.create({ name: env.adminName, email: env.adminEmail, password: env.adminPassword, role: 'admin' });
    console.log(`Admin account created for ${env.adminEmail}`);
  } else if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save({ validateBeforeSave: false });
    console.log(`Existing account ${env.adminEmail} promoted to admin`);
  }
}
