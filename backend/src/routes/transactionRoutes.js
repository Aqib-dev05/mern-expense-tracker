import { Router } from 'express';
import * as c from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  createTransactionSchema, updateTransactionSchema, listTransactionsQuerySchema,
} from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate(listTransactionsQuerySchema, 'query'), c.list);
router.post('/', validate(createTransactionSchema), c.create);
router.get('/:id', validateObjectId(), c.getOne);
router.patch('/:id', validateObjectId(), validate(updateTransactionSchema), c.update);
router.delete('/:id', validateObjectId(), c.remove);
export default router;
