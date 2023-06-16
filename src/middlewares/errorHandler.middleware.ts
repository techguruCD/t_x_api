import { ExpressError } from '../utils/error.utils';

import type { NextFunction, Request, Response } from 'express';

export default function errorHandler(
  _err: ExpressError,
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  return _res.status(_err.statusCode ?? 500).json({
    message: _err.message ?? 'Something Went Wrong',
    code: _err.code ?? 'EHG00001',
    statusCode: _err.statusCode ?? 500,
  });
}
