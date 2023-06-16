import { NextFunction, Request, Response } from 'express';
import { is, validate } from 'superstruct';
import bitqueryCoinSearchService from './services/bitqueryCoinSearch.service';
import bitqueryPairSearchService from './services/bitqueryPairSearch.service';
import coinFavService from './services/coinFav.service';
import { ExpressError } from './utils/error.utils';
import RequestValidator from './validators/request.validator';
// import bitqueryPriceSubscriptionService from './services/priceSubscription.service';

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
      data = await bitqueryCoinSearchService(body.args);
    }

    if (body.method === 'searchPairs') {
      data = await bitqueryPairSearchService(body.args);
    }

    if (body.method === 'setFavCoin') {
      data = await coinFavService.setFavCoin(body.args);
    }

    if (body.method === 'setPairPriceAlert') {
      return _res.status(200).json({ message: 'SUCCESS' });
      // data = await bitqueryPriceSubscriptionService(body.args);
    }

    return _res.status(200).json(data);
  } catch (error) {
    _next(error);
    return;
  }
}

export default controller;
