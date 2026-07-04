import express from 'express';
import { create, list, getById, update, remove } from '../controllers/table.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createTableSchema, updateTableSchema } from '../validators/table.validator.js';

const router = express.Router();

// Enforce authentication context for all endpoints
router.use(protect);

router.get('/', list);
router.get('/:id', getById);

// Restrict administrative actions (create, edit, delete) to Admin role
router.post('/', authorize('admin'), validateRequest(createTableSchema), create);
router.put('/:id', authorize('admin'), validateRequest(updateTableSchema), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
