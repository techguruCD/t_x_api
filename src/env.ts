import dotenv from 'dotenv';

import type { IEnv } from './interfaces/env.interfaces';

let _env: IEnv | undefined = undefined;

export function initEnv() {
  dotenv.config();

  if (!process.env['BITQUERY_API_KEY']) {
    console.log('[error] BITQUERY_API_KEY is not set in the env');
    process.exit(0);
  }

  _env = {
    dbUri: process.env['DB_URI'] ?? 'mongodb://127.0.0.1:27017/bitquery',
    debug: Boolean(process.env['DEBUG']) ?? true,
    host: process.env['HOST'] ?? 'localhost',
    port: process.env['PORT'] ?? 3001,
    trustProxy: Boolean(process.env['PROXY']) ?? false,
    bitqueryEndpoint: 'https://graphql.bitquery.io',
    bitqueryApiKey: process.env['BITQUERY_API_KEY'],
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
