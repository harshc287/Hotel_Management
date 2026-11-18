
import * as authService from '../services/authService.js';
import { HttpError } from '../utils/apiResponse.js';
import {
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/generateToken.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      role: req.body.role ?? 'customer',
      restaurantName: req.body.restaurantName,
    });

    setRefreshCookie(res, result.refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user) {
      throw new HttpError('Authentication required.', 401);
    }

    const user = {
      id: String(req.user._id),
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      restaurantId: req.user.restaurant
        ? String(req.user.restaurant)
        : null,
    };

    return res.status(200).json({
      success: true,
      message: 'User fetched successfully.',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;

    const result = await authService.refresh(token);

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    clearRefreshCookie(res);
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (!req.user?._id) {
      throw new HttpError('Authentication required.', 401);
    }

    await authService.logout(req.user._id);

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}
