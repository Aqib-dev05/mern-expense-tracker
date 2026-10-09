import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/reportService.js';

export const summary = asyncHandler(async (req, res) => res.json(await svc.getReportSummary(req.user._id, req.validatedQuery)));
export const exportCsv = asyncHandler(async (req, res) => svc.streamCsv(req.user._id, req.validatedQuery, res));
