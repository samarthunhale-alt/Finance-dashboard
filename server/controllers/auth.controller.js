import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import { logActivity } from '../utils/activity.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');

  // Role is never taken from the request body: public sign-ups are always regular users.
  const user = await User.create({ name, email, password, lastLoginAt: new Date(), lastActiveAt: new Date() });
  logActivity(user._id, 'register');
  res.status(201).json({ success: true, data: { token: signToken(user), user } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  const now = new Date();
  await User.updateOne({ _id: user._id }, { lastLoginAt: now, lastActiveAt: now });
  logActivity(user._id, 'login');
  res.json({ success: true, data: { token: signToken(user), user } });
});

// JWTs are stateless, so logout is handled client-side by discarding the token; this records the event.
export const logout = asyncHandler(async (req, res) => {
  logActivity(req.user._id, 'logout');
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
