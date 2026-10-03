import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateMe, changePassword, listUsers, getUser, updateUser, deleteUser, listActivity,
} from '../controllers/users.controller.js';

const router = Router();
router.use(protect);

router.patch(
  '/me',
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']).withMessage('Unsupported currency'),
  ],
  validate,
  updateMe
);

router.patch(
  '/me/password',
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isString()
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/)
      .withMessage('New password must be 8-72 characters and include a letter and a number'),
  ],
  validate,
  changePassword
);

// ---- Admin only ----
router.get(
  '/activity',
  authorize('admin'),
  [query('userId').optional().isMongoId(), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  listActivity
);

router.get(
  '/',
  authorize('admin'),
  [query('role').optional().isIn(['user', 'admin']), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validate,
  listUsers
);

router.get('/:id', authorize('admin'), [param('id').isMongoId().withMessage('Invalid user id')], validate, getUser);

router.patch(
  '/:id',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  ],
  validate,
  updateUser
);

router.delete('/:id', authorize('admin'), [param('id').isMongoId().withMessage('Invalid user id')], validate, deleteUser);

export default router;
