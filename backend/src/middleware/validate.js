import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

const zodToApiError = (error) => {
  const details = error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  return new ApiError(400, details[0]?.message || 'Validation failed', details);
};

/** validate(schema, 'body' | 'query'). Parsed query data is exposed as req.validatedQuery. */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(zodToApiError(result.error));
  if (source === 'query') req.validatedQuery = result.data;
  else req[source] = result.data;
  next();
};

/** Rejects malformed ObjectIds before they ever reach Mongoose. */
export const validateObjectId = (param = 'id') => (req, res, next) => {
  const value = req.params[param];
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value) || !mongoose.isValidObjectId(value)) {
    return next(new ApiError(400, 'Invalid id'));
  }
  next();
};
