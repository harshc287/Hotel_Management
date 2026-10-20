import { User } from '../models/User.js';
import { HttpError } from '../utils/apiResponse.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken.js';

export async function register({ name, email, password, phone }) {
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError('Email already registered', 409);

  const user = new User({ name, email, phone, role: 'customer' });
  await user.setPassword(password);
  await user.save();

  return issueTokens(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) throw new HttpError('Invalid credentials', 401);
  const ok = await user.verifyPassword(password);
  if (!ok) throw new HttpError('Invalid credentials', 401);

  user.lastLoginAt = new Date();
  await user.save();
  return issueTokens(user);
}

export async function refresh(token) {
  if (!token) throw new HttpError('Refresh token missing', 401);
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new HttpError('Invalid refresh token', 401);
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new HttpError('User invalid', 401);
  if ((payload.v || 0) !== user.refreshTokenVersion) {
    throw new HttpError('Refresh token revoked', 401);
  }
  return issueTokens(user);
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
}

function issueTokens(user) {
  const base = { sub: String(user._id), role: user.role };
  const accessToken = signAccessToken(base);
  const refreshToken = signRefreshToken({ ...base, v: user.refreshTokenVersion });
  return { user: user.toPublic(), accessToken, refreshToken };
}