import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/analyticsService.js';

export const summary = asyncHandler(async (req, res) => res.json(await svc.getSummary(req.user._id, req.validatedQuery)));
export const monthly = asyncHandler(async (req, res) => res.json(await svc.getTrend(req.user._id, req.validatedQuery)));
export const categories = asyncHandler(async (req, res) =>
  res.json(await svc.getCategoryBreakdown(req.user._id, req.validatedQuery)));
