import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/budgetService.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ budgets: await svc.listBudgets(req.user._id, req.validatedQuery) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ budget: await svc.createBudget(req.user._id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ budget: await svc.updateBudget(req.user._id, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteBudget(req.user._id, req.params.id);
  res.json({ message: 'Budget deleted' });
});
