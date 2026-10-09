import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Verifies the Bearer token and attaches the authenticated user. The user id NEVER comes from the request body. */
export const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication required');

  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account no longer exists');

  req.user = user;
  next();
});
