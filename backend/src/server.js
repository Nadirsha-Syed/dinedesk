import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

let server;

// Capture uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception! Shutting down server immediately...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  server = app.listen(env.PORT, () => {
    console.log(`[Server] DineDesk Backend running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  });
};

// Capture unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('[CRITICAL] Unhandled Promise Rejection! Initiating graceful shutdown...');
  console.error(err.name, err.message, err.stack);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP listener closed.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer();
