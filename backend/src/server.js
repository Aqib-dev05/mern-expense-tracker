import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';

async function start() {
  await connectDB();
  const server = app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}/api`));

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
