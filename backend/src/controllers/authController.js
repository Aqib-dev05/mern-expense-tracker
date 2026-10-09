import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ user, token });
});

// JWTs are stateless: the client discards the token. The endpoint exists so clients have one place to hook logout.
export const logout = (req, res) => res.json({ message: 'Logged out' });

export const me = (req, res) => res.json({ user: req.user });

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ user });
});
