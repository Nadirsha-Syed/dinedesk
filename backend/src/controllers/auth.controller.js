import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return ApiResponse.created(res, result, 'User registration completed successfully.');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return ApiResponse.success(res, result, 'User authenticated successfully.');
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by protect security middleware
  const profile = await authService.getUserProfile(req.user.id);
  return ApiResponse.success(res, profile, 'Profile details retrieved successfully.');
});

export const logout = asyncHandler(async (req, res) => {
  // JWT deletion is handled on client storage, return success envelope
  return ApiResponse.success(res, null, 'User signed out successfully.');
});
