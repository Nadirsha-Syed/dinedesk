import { env } from '../config/env.js';
import { ApiError } from '../errors/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert unexpected errors or database exceptions to standard ApiError format
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Something went wrong';
    let errors = [];

    // Handle mongoose validation issues
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      errors = Object.values(error.errors).map((el) => el.message);
    } 
    // Handle MongoDB duplicate key issues (e.g. unique emails or table numbers)
    else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  // Log internal unexpected errors for review
  if (env.NODE_ENV === 'development' || !error.isOperational) {
    console.error(`[Error LOG] Path: ${req.method} ${req.originalUrl}`);
    console.error(err);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
