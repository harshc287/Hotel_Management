
// import bcrypt from 'bcryptjs';
// import User from '../models/User.js';
// import Restaurant from '../models/Restaurant.js';
// import { generateToken } from '../utils/generateToken.js';
// import { httpError } from '../utils/apiResponse.js';

// export async function register(req, res) {
//   const { name, email, password, role = 'customer', restaurantName } = req.body;
//   if (await User.exists({ email: email.toLowerCase() })) throw httpError(409, 'Email already registered');
//   // Public registration never grants staff or administrator privileges.
//   const safeRole = role === 'manager' ? 'manager' : 'customer';
//   const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: safeRole });
//   if (safeRole === 'manager') {
//     const base = (restaurantName || `${name} restaurant`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
//     let slug = base || `restaurant-${user._id.toString().slice(-6)}`;
//     if (await Restaurant.exists({ slug })) slug = `${slug}-${user._id.toString().slice(-6)}`;
//     const restaurant = await Restaurant.create({ name: restaurantName || `${name}'s Restaurant`, slug, owner: user._id });
//     user.restaurantId = restaurant._id; await user.save();
//   }
//   res.status(201).json({ token: generateToken(user), user: safeUser(user) });
// }
// export async function login(req, res) {
//   const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
//   if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) throw httpError(401, 'Invalid email or password');
//   if (!user.active) throw httpError(403, 'Account disabled');
//   res.json({ token: generateToken(user), user: safeUser(user) });
// }
// export async function me(req, res) { res.json({ user: safeUser(req.user) }); }
// function safeUser(user) { return { id: user._id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId }; }

import * as authService from '../services/authService.js';
import { ok, fail } from '../utils/apiResponse.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/generateToken.js';

export async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    return ok(res, { user, accessToken }, 'Registered', 201);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    return ok(res, { user, accessToken }, 'Logged in');
  } catch (e) {
    next(e);
  }
}

export async function refresh(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.refresh(req.cookies.refreshToken);
    setRefreshCookie(res, refreshToken);
    return ok(res, { user, accessToken }, 'Refreshed');
  } catch (e) {
    clearRefreshCookie(res);
    next(e);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) await authService.logout(req.user._id);
    clearRefreshCookie(res);
    return ok(res, null, 'Logged out');
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  return ok(res, { user: req.user.toPublic() });
}