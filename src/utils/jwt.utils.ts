import jwt from 'jsonwebtoken';
import env from '../env';
import { ExpressError } from './error.utils';

function generateToken(params: {
  userId: string;
  deviceId: string;
  tokenType: 'ACCESS' | 'REFRESH';
}) {
  if (params.tokenType === 'ACCESS') {
    return jwt.sign(params, env().accessJwtSecret, { expiresIn: '7d' });
  }
  return jwt.sign(params, env().refreshJwtSecret, { expiresIn: '7d' });
}

function verifyToken(token: string, tokenType: 'ACCESS' | 'REFRESH') {
  const decoded = jwt.verify(
    token,
    tokenType === 'ACCESS' ? env().accessJwtSecret : env().refreshJwtSecret
  );

  if (typeof decoded === 'string') {
    throw new ExpressError('EVT00001', 'Invalid token', 400);
  }

  return decoded as jwt.JwtPayload & {
    userId: string;
    deviceId: string;
  };
}

export default {
  generateToken,
  verifyToken,
};
