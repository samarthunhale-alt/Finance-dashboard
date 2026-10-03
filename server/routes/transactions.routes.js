import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction,
} from '../controllers/transactions.controller.js';

const router = Router();
router.use(protect);

const id = param('id').isMongoId().withMessage('Invalid transaction id');

const listRules = [
  query('type').optional({ values: 'falsy' }).isIn(['income', 'expense']),
  query('category').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid category'),
  query('startDate').optional({ values: 'falsy' }).isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional({ values: 'falsy' }).isISO8601().withMessage('endDate must be a valid date'),
  query('minAmount').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('minAmount must be a positive number'),
  query('maxAmount').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('maxAmount must be a positive number'),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }),
  query('sortBy').optional({ values: 'falsy' }).isIn(['date', 'amount', 'createdAt']),
  query('order').optional({ values: 'falsy' }).isIn(['asc', 'desc']),
];

const createRules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01, max: 1e9 }).withMessage('Amount must be between 0.01 and 1,000,000,000').toFloat(),
  body('category').isMongoId().withMessage('Select a valid category'),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }).withMessage('Description must be at most 200 characters'),
  body('date').optional({ values: 'falsy' }).isISO8601().withMessage('Enter a valid date').toDate(),
];

const updateRules = [
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').optional().isFloat({ min: 0.01, max: 1e9 }).withMessage('Amount must be between 0.01 and 1,000,000,000').toFloat(),
  body('category').optional().isMongoId().withMessage('Select a valid category'),
  body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 200 }).withMessage('Description must be at most 200 characters'),
  body('date').optional().isISO8601().withMessage('Enter a valid date').toDate(),
];

router.get('/', listRules, validate, listTransactions);
router.post('/', createRules, validate, createTransaction);
router.get('/:id', [id], validate, getTransaction);
router.put('/:id', [id, ...updateRules], validate, updateTransaction);
router.patch('/:id', [id, ...updateRules], validate, updateTransaction);
router.delete('/:id', [id], validate, deleteTransaction);

export default router;
