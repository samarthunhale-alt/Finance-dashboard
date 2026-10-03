import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listGoals, savingsSummary, createGoal, updateGoal, contribute, deleteGoal } from '../controllers/savings.controller.js';

const router = Router();
router.use(protect);

const id = param('id').isMongoId().withMessage('Invalid savings goal id');

const goalRules = (optional) => {
  const o = (chain) => (optional ? chain.optional() : chain);
  return [
    o(body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters')),
    o(body('targetAmount').isFloat({ min: 1 }).withMessage('Target must be at least 1').toFloat()),
    body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Saved amount cannot be negative').toFloat(),
    body('deadline').optional({ values: 'falsy' }).isISO8601().withMessage('Enter a valid deadline').toDate(),
    body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
  ];
};

router.get('/', listGoals);
router.get('/summary', savingsSummary);
router.post('/', goalRules(false), validate, createGoal);
router.put('/:id', [id, ...goalRules(true)], validate, updateGoal);
router.patch('/:id', [id, ...goalRules(true)], validate, updateGoal);
router.post(
  '/:id/contribute',
  [id, body('amount').isFloat().custom((v) => Number(v) !== 0).withMessage('Amount must be a non-zero number').toFloat()],
  validate,
  contribute
);
router.delete('/:id', [id], validate, deleteGoal);

export default router;
