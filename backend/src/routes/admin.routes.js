import express from 'express';
import { getStats, listReservations, updateReservation, cancelReservation } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { updateReservationSchema } from '../validators/reservation.validator.js';

const router = express.Router();

// Enforce authentication context and Admin authorization restrictions
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/reservations', listReservations);
router.put('/reservations/:id', validateRequest(updateReservationSchema), updateReservation);
router.patch('/reservations/:id/cancel', cancelReservation);

export default router;
