import { ExpressError } from '../utils/error.utils';

import type { NextFunction, Request, Response } from 'express';

export default function errorHandler(
  _err: ExpressError,
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  return _res.status(_err.statusCode).json({
    message: _err.message,
    code: _err.code,
    statusCode: _err.statusCode,
  });
}
