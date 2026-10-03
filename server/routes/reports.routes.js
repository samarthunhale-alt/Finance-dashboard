import { Router } from 'express';
import { query } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getDashboard, getIncomeExpense, getExpenseByCategory, getMonthlySpending, getSavingsTrend,
  getBudgetUtilization, getAdminOverview, getAdminMonthly,
} from '../controllers/reports.controller.js';

const router = Router();
router.use(protect);

const months = query('months').optional({ values: 'falsy' }).isInt({ min: 1, max: 24 }).withMessage('months must be 1-24');
const month = query('month').optional({ values: 'falsy' }).matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('month must be YYYY-MM');

router.get('/dashboard', getDashboard);
router.get('/income-expense', [months], validate, getIncomeExpense);
router.get('/expense-by-category', [month], validate, getExpenseByCategory);
router.get('/monthly-spending', [months], validate, getMonthlySpending);
router.get('/savings-trend', [months], validate, getSavingsTrend);
router.get('/budget-utilization', [month], validate, getBudgetUtilization);

router.get('/admin/overview', authorize('admin'), getAdminOverview);
router.get('/admin/monthly', authorize('admin'), [months], validate, getAdminMonthly);

export default router;
