import env, { initEnv } from './env';

// init env
console.log('[info] initializing env');
initEnv();

import http from 'http';
import mongoose from 'mongoose';
import app from './app';

const httpServer = http.createServer(app);

httpServer.listen({
  port: env().port,
  host: '0.0.0.0',
});

httpServer.on('listening', async () => {
  console.log(`[info] listening to ${env().host}:${env().port}`);
  mongoose.set('strictQuery', true);
  const db = await mongoose.connect(env().dbUri);
  console.log(`[info] connected to ${db.connection.db.databaseName}`);
});

process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  console.error(error);
  process.exit(1);
});
