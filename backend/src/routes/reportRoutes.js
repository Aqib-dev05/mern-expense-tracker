import { Router } from 'express';
import * as c from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportQuerySchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/summary', validate(reportQuerySchema, 'query'), c.summary);
router.get('/export', validate(reportQuerySchema, 'query'), c.exportCsv);
export default router;
