import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
