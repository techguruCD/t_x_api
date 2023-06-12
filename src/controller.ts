import { NextFunction, Request, Response } from 'express';
import { is, validate } from 'superstruct';
import RequestValidator from './validators/request.validator';
import { ExpressError } from './utils/error.utils';
import coinSearchService from './services/coinSearch.service';
import pairSearchService from './services/pairSearch.service';
import priceSubscriptionService from './services/priceSubscription.service';

async function controller(_req: Request, _res: Response, _next: NextFunction) {
  try {
    const body = _req.body;

    if (!is(body, RequestValidator)) {
      const [error] = validate(body, RequestValidator);
      if (!error) {
        throw new ExpressError('E00001', 'Unexpected condition!', 400);
      }
      throw new ExpressError('E00002', error.message, 400);
    }

    let data = null;

    if (body.method === 'searchCoin') {
      data = await coinSearchService(body.args);
    }

    if (body.method === 'searchPairs') {
      data = await pairSearchService(body.args);
    }

    if (body.method === 'setPairPriceAlert') {
      return _res.status(200).json({ message: 'SUCCESS' });
      // data = await priceSubscriptionService(body.args);
    }

    return _res.status(200).json(data);
  } catch (error) {
    _next(error);
    return;
  }
}

export default controller;
