import express from 'express';
import { create, listUpcoming, listPast, cancel, getDetails } from '../controllers/reservation.controller.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createReservationSchema } from '../validators/reservation.validator.js';

const router = express.Router();

// Enforce authentication for all reservation routes
router.use(protect);

router.post('/', validateRequest(createReservationSchema), create);
router.get('/upcoming', listUpcoming);
router.get('/past', listPast);
router.get('/:id', getDetails);
router.patch('/:id/cancel', cancel);

export default router;
