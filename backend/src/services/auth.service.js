import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../errors/ApiError.js';
import { env } from '../config/env.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Verify email duplication
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // Save records
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const loginUser = async (email, password) => {
  // Query record including password explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  // Compare input password and hashed storage
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('Profile record not found.');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
