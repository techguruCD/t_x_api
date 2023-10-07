import { NextFunction, Request, Response } from 'express';
import { is, validate } from 'superstruct';
import aegisService from '../services/aegis.service';
// import alertService from '../services/alert.service';
import coinService from '../services/coin.service';
import coinFavService from '../services/coinFav.service';
import userService from '../services/user.service';
import { ExpressError } from '../utils/error.utils';
import RequestValidator from '../validators/request.validator';

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

    if (body.method === 'search') {
      data = await coinService.coinSearch(body.args);
    }

    if (body.method === 'getNetworks') {
      data = await coinService.getNetworks();
    }

    if (body.method === 'setFavCoin') {
      data = await coinFavService.setFavCoin({
        ...body.args,
        userId: _req.user.userId,
      });
    }

    if (body.method === 'getFavCoin') {
      data = await coinFavService.getFavCoin({
        ...body.args,
        userId: _req.user.userId,
      });
    }

    if (body.method === 'removeFavCoin') {
      data = await coinFavService.removeFavCoin({
        ...body.args,
        userId: _req.user.userId,
      });
    }

    if (body.method === 'updateUser') {
      data = await userService.updateUserService({
        ...body.args,
        userId: _req.user.userId,
      });
    }

    if (body.method === 'getUser') {
      data = await userService.getUserService({
        userId: _req.user.userId,
      });
    }

    // if (body.method === 'setAlert') {
    //   data = await alertService.setAlert({
    //     ...body.args,
    //     userId: _req.user.userId,
    //   });
    // }

    // if (body.method === 'deleteAlert') {
    //   data = await alertService.deleteAlert({
    //     ...body.args,
    //     userId: _req.user.userId,
    //   });
    // }

    // if (body.method === 'getAlerts') {
    //   data = await alertService.getAlerts({ userId: _req.user.userId, executed: body.args.executed });
    // }

    // if (body.method === 'getAlert') {
    //   data = await alertService.getAlert({
    //     ...body.args,
    //     userId: _req.user.userId,
    //   });
    // }

    if (body.method === 'coinInfo') {
      data = await coinService.getCoinInfo({ ...body.args, userId: _req.user.userId })
    }

    if (body.method === 'logout') {
      data = await userService.logout({ userId: _req.user.userId, deviceId: _req.user.deviceId });
    }

    if (body.method === 'listTop100') {
      data = await coinService.getTop100()
    }

    if (body.method === 'getScanData') {
      data = await aegisService.getTokenQuickCheckData(body.args);
    }

    return _res.status(200).json(data);
  } catch (error) {
    _next(error);
    return;
  }
}

export default controller;
