import { Router } from 'express';
import * as c from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rangeQuerySchema, categoriesQuerySchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/summary', validate(rangeQuerySchema, 'query'), c.summary);
router.get('/monthly', validate(rangeQuerySchema, 'query'), c.monthly);
router.get('/categories', validate(categoriesQuerySchema, 'query'), c.categories);
export default router;
