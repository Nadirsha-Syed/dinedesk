import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { ApiError } from './errors/ApiError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './utils/apiResponse.js';
import authRoutes from './routes/auth.routes.js';
import tableRoutes from './routes/table.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check API
app.get('/health', (req, res) => {
  return ApiResponse.success(res, { uptime: process.uptime() }, 'DineDesk API is healthy');
});

// Routes configuration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
  return ApiResponse.success(res, null, 'Welcome to DineDesk API');
});

// Fallback Route Handler (404)
app.use('*', (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global Exception Interceptor
app.use(errorHandler);

export { app };
