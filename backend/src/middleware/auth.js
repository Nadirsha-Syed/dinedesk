import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../errors/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Parse authorization headers for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized. No credentials provided.');
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Confirm that the user record still exists in storage
    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    // Attach details to request scope
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication session expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid or corrupted credentials.');
  }
});

// Role-based Access Control (RBAC) middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Session user context is missing.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('Access forbidden. You do not possess the required role permissions.')
      );
    }

    next();
  };
};
