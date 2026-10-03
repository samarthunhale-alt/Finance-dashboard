import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js';

const router = Router();
router.use(protect);

const id = param('id').isMongoId().withMessage('Invalid category id');

router.get('/', [query('type').optional({ values: 'falsy' }).isIn(['income', 'expense'])], validate, listCategories);
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Name must be 2-30 characters'),
    body('type').optional().isIn(['income', 'expense', 'both']).withMessage('Type must be income, expense or both'),
  ],
  validate,
  createCategory
);
router.patch(
  '/:id',
  [
    id,
    body('name').optional().trim().isLength({ min: 2, max: 30 }).withMessage('Name must be 2-30 characters'),
    body('type').optional().isIn(['income', 'expense', 'both']).withMessage('Type must be income, expense or both'),
  ],
  validate,
  updateCategory
);
router.delete('/:id', [id], validate, deleteCategory);

export default router;
