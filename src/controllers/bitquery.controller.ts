import { NextFunction, Request, Response } from 'express';

async function bitqueryController(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    return _res.status(200).json({ msg: 'BITQUERY' });
  } catch (error) {
    next();
    return;
  }
}

export default {
  bitqueryController,
};
