import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { algorithm: 'HS256', expiresIn: env.jwtExpiresIn });

export async function register({ name, email, password, currency }) {
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name, email, password, ...(currency && { currency }) });
  return { user, token: signToken(user._id) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  const valid = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !valid) throw new ApiError(401, 'Invalid email or password');
  return { user, token: signToken(user._id) };
}

export async function updateProfile(userId, data) {
  if (data.email && (await User.exists({ email: data.email, _id: { $ne: userId } }))) {
    throw new ApiError(409, 'An account with this email already exists');
  }
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
