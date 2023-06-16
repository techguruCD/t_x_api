import env, { initEnv } from './env';

// init env
console.log('[info] initializing env');
initEnv();

import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import cgRequests from './coingecko/requests';

const httpServer = http.createServer(app);

httpServer.listen({
  port: env().port,
  host: env().host,
});

httpServer.on('listening', async () => {
  console.log(`[info] listening to ${env().host}:${env().port}`);
  mongoose.set('strictQuery', true);
  const db = await mongoose.connect(env().dbUri);
  const data = await cgRequests.tokenPrice({
    id: 'ordinals',
    contract_addresses: [
      'd63a6e6ce0fb2b49ba3d939880666b5799551e266443feabab4d3e57cc492cd8i0',
    ],
    vs_currencies: ['usd'],
  });

  console.log(`>>`, data);
  console.log(`[info] connected to ${db.connection.db.databaseName}`);
});

process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  console.error(error);
  process.exit(1);
});
