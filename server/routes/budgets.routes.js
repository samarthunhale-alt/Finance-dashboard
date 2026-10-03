import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listBudgets, getBudget, createBudget, updateBudget, deleteBudget } from '../controllers/budgets.controller.js';

const router = Router();
router.use(protect);

const id = param('id').isMongoId().withMessage('Invalid budget id');
const monthRule = (chain) => chain.matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must be in YYYY-MM format');

const categoryRules = [
  body('categoryBudgets').optional().isArray({ max: 30 }).withMessage('categoryBudgets must be an array'),
  body('categoryBudgets.*.category').isMongoId().withMessage('Each category budget needs a valid category'),
  body('categoryBudgets.*.amount').isFloat({ min: 0.01 }).withMessage('Each category budget must be greater than 0').toFloat(),
];

router.get('/', [monthRule(query('month').optional({ values: 'falsy' }))], validate, listBudgets);
router.post(
  '/',
  [
    monthRule(body('month')),
    body('totalAmount').isFloat({ min: 0.01 }).withMessage('Total budget must be greater than 0').toFloat(),
    ...categoryRules,
  ],
  validate,
  createBudget
);
router.get('/:id', [id], validate, getBudget);
const updateRules = [id, body('totalAmount').optional().isFloat({ min: 0.01 }).withMessage('Total budget must be greater than 0').toFloat(), ...categoryRules];
router.put('/:id', updateRules, validate, updateBudget);
router.patch('/:id', updateRules, validate, updateBudget);
router.delete('/:id', [id], validate, deleteBudget);

export default router;
