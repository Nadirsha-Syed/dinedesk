import { ApiError } from '../errors/ApiError.js';

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    // Sanitize and validate request body
    const validatedBody = await schema.parseAsync(req.body);
    req.body = validatedBody;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return next(ApiError.badRequest('Validation Failed', errorMessages));
    }
    next(error);
  }
};
