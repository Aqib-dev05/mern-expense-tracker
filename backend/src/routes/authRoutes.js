import { Router } from 'express';
import * as c from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), c.register);
router.post('/login', authLimiter, validate(loginSchema), c.login);
router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);
router.patch('/me', authenticate, validate(updateProfileSchema), c.updateMe);
export default router;
