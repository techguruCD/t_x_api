import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ExpressError } from '../utils/error.utils';
import jwtUtils from '../utils/jwt.utils';

async function authMiddleware(
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  try {
    const token = _req.headers.authorization;
    if (!token) {
      return _next(new ExpressError('EUA00003', 'Unauthorized', 401));
    }

    const decodedToken = jwtUtils.verifyToken(token, 'ACCESS');

    _req.user = {
      userId: decodedToken.userId,
      deviceId: decodedToken.deviceId,
    };

    _next();
  } catch (error) {
    if (error instanceof jwt.NotBeforeError) {
      return _next(new ExpressError('EJE00001', `${error.message}`, 403));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return _next(
        new ExpressError('EJE00002', `Token expired at ${error.expiredAt}`, 403)
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return _next(new ExpressError('EJE00003', `${error.message}`, 401));
    }
    return _next(new ExpressError('EUA00001', 'Unauthorized', 401));
  }
}

export default authMiddleware;
