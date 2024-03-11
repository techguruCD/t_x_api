import { NextFunction, Request, Response } from 'express';
import { is, validate } from 'superstruct';
import coinService from '../services/coin.service';
import tokenCreateService from '../services/tokenCreate.service';
import tokenRefreshService from '../services/tokenRefresh.service';
import { ExpressError } from '../utils/error.utils';
import RequestValidator from '../validators/request.validator';

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

    if (body.method === 'coinInfo') {
      data = await coinService.getCoinInfo({...body.args, ip: _req.ip})
    }

    return _res.status(200).json(data);
  } catch (error) {
    console.log(`3`, error);
    _next(error);
    return;
  }
}

export default publicController;
