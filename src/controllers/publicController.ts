import { NextFunction, Request, Response } from 'express';
import RequestValidator from '../validators/request.validator';
import { is, validate } from 'superstruct';
import { ExpressError } from '../utils/error.utils';
import tokenCreateService from '../services/tokenCreate.service';
import tokenRefreshService from '../services/tokenRefresh.service';

async function publicController(
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  try {
    const body = _req.body;

    if (!is(body, RequestValidator)) {
      const [error] = validate(body, RequestValidator);
      if (!error) {
        console.log(`1`);
        throw new ExpressError('E00002', 'Unexpected condition!', 400);
      }
      console.log(`2`, error);
      throw new ExpressError('E00003', error.message, 400);
    }

    let data = null;

    if (body.method === 'tokenCreate') {
      data = await tokenCreateService(body.args);
    }

    if (body.method === 'tokenRefresh') {
      data = await tokenRefreshService(body.args);
    }

    return _res.status(200).json(data);
  } catch (error) {
    console.log(`3`, error);
    _next(error);
    return;
  }
}

export default publicController;
