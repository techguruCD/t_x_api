import dotenv from 'dotenv';

import type { IEnv } from './interfaces/env.interfaces';

let _env: IEnv | undefined = undefined;

export function initEnv() {
  dotenv.config();

  if (!process.env['BITQUERY_API_KEY']) {
    console.log('[error] BITQUERY_API_KEY is not set in the env');
    process.exit(0);
  }

  if (!process.env['ACCESS_JWT_SECRET']) {
    console.log('[error] JWT_SECRET is not set in the env');
    process.exit(0);
  }

  if (!process.env['REFRESH_JWT_SECRET']) {
    console.log('[error] REFRESH_JWT_SECRET is not set in the env');
    process.exit(0);
  }

  if (!process.env['CRYPTO_SECRET']) {
    console.log('[error] CRYPTO_SECRET is not set in the env');
    process.exit(0);
  }

  if (!process.env['CG_API_KEY']) {
    console.log('[error] CG_API_KEY is not set in the env');
    process.exit(0);
  }

  _env = {
    dbUri: process.env['DB_URI'] ?? 'mongodb://127.0.0.1:27017/bitquery',
    debug: Boolean(process.env['DEBUG']) ?? true,
    host: process.env['HOST'] ?? '127.0.0.1',
    port: process.env['PORT'] ?? 5001,
    trustProxy: Boolean(process.env['PROXY']) ?? false,
    bitqueryEndpoint: 'https://graphql.bitquery.io',
    bitqueryStreamingEndpoint: 'https://streaming.bitquery.io/graphql',
    bitqueryWs: 'wss://streaming.bitquery.io/graphql',
    bitqueryApiKey: process.env['BITQUERY_API_KEY'],
    accessJwtSecret: process.env['ACCESS_JWT_SECRET'],
    refreshJwtSecret: process.env['REFRESH_JWT_SECRET'],
    cryptoSecret: process.env['CRYPTO_SECRET'],
    cgBaseUrl: 'https://pro-api.coingecko.com/api/v3',
    cgApiKey: process.env['CG_API_KEY'],
    geckoTerminalBaseUrl: 'https://api.geckoterminal.com/api/v2',
  };

  if (_env.debug) {
    console.log('[info] DEBUG ENABLED');
  }

  if (_env.trustProxy) {
    console.log('[info] PROXY ENABLED');
  }

  return _env;
}

export default function env() {
  if (!_env) {
    throw new Error('[error] Environment Variables are not initialized!');
  }
  return _env;
}
