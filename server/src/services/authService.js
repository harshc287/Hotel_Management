
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { HttpError } from '../utils/apiResponse.js';

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken.js';

export async function register({
  name,
  email,
  password,
  phone,
  role = 'customer',
  restaurantName,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!['customer', 'manager'].includes(role)) {
    throw new HttpError('Invalid registration role.', 400);
  }

  if (role === 'manager' && (!restaurantName || restaurantName.trim().length < 2)) {
    throw new HttpError('Restaurant name must contain at least 2 characters.', 400);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new HttpError('Email already registered.', 409);
  }

  let user;
  let restaurant;

  try {
    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      role,
    });

    await user.setPassword(password);
    await user.save();

    if (role === 'manager') {
      restaurant = await Restaurant.create({
        name: restaurantName.trim(),
      });

      user.restaurant = restaurant._id;
      await user.save();
    }

    return issueTokens(user);
  } catch (error) {
    // Clean up partially created records if registration fails.
    if (restaurant?._id) {
      await Restaurant.deleteOne({ _id: restaurant._id }).catch(() => {});
    }

    if (user?._id) {
      await User.deleteOne({ _id: user._id }).catch(() => {});
    }

    if (error?.code === 11000) {
      throw new HttpError('Email already registered.', 409);
    }

    throw error;
  }
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail })
    .select('+passwordHash');

  if (!user || !user.isActive) {
    throw new HttpError('Invalid email or password.', 401);
  }

  const passwordMatches = await user.verifyPassword(password);

  if (!passwordMatches) {
    throw new HttpError('Invalid email or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return issueTokens(user);
}

export async function refresh(token) {
  if (!token) {
    throw new HttpError('Refresh token is missing.', 401);
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new HttpError('Refresh token is invalid or expired.', 401);
  }

  if (!payload.sub) {
    throw new HttpError('Invalid refresh token payload.', 401);
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new HttpError('User account is unavailable.', 401);
  }

  if ((payload.v ?? 0) !== (user.refreshTokenVersion ?? 0)) {
    throw new HttpError('Refresh token has been revoked.', 401);
  }

  return issueTokens(user);
}

export async function logout(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { refreshTokenVersion: 1 } },
    { new: true }
  );

  if (!user) {
    throw new HttpError('User account not found.', 404);
  }

  return true;
}

function issueTokens(user) {
  const payload = {
    sub: String(user._id),
    role: user.role,
    restaurantId: user.restaurant
      ? String(user.restaurant)
      : null,
    v: user.refreshTokenVersion ?? 0,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurant
        ? String(user.restaurant)
        : null,
    },
    accessToken,
    refreshToken,
  };
}
