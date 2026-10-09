import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/transactionService.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await svc.listTransactions(req.user._id, req.validatedQuery));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({ transaction: await svc.getTransaction(req.user._id, req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ transaction: await svc.createTransaction(req.user._id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ transaction: await svc.updateTransaction(req.user._id, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteTransaction(req.user._id, req.params.id);
  res.json({ message: 'Transaction deleted' });
});
