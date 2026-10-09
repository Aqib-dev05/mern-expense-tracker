import { Router } from 'express';
import * as c from '../controllers/budgetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { createBudgetSchema, updateBudgetSchema, listBudgetsQuerySchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate(listBudgetsQuerySchema, 'query'), c.list);
router.post('/', validate(createBudgetSchema), c.create);
router.patch('/:id', validateObjectId(), validate(updateBudgetSchema), c.update);
router.delete('/:id', validateObjectId(), c.remove);
export default router;
