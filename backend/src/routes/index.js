import { Router } from 'express';
import auth from './authRoutes.js';
import transactions from './transactionRoutes.js';
import budgets from './budgetRoutes.js';
import analytics from './analyticsRoutes.js';
import reports from './reportRoutes.js';

const router = Router();
router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', auth);
router.use('/transactions', transactions);
router.use('/budgets', budgets);
router.use('/analytics', analytics);
router.use('/reports', reports);
export default router;
