import { NextFunction, Request, Response } from 'express';
import favCoinsModel from '../models/favCoins.model';
import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';

async function priceUpdateController(
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  try {
    const coinGroups = await favCoinsModel.aggregate([
      {
        $lookup: {
          from: 'Coins',
          localField: 'address',
          foreignField: 'address',
          as: 'coinInfo',
        },
      },
      {
        $unwind: {
          path: '$coinInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$coinInfo.network',
          assetPlatform: {
            $first: '$coinInfo.assetPlatform',
          },
          addresses: {
            $addToSet: '$coinInfo.address',
          },
        },
      },
    ]);

    const priceUpdates = [];

    for (let i = 0; i < coinGroups.length; i++) {
      const group = coinGroups[i];
      const tokenPrices = await cgRequests.tokenPrice({
        id: group.assetPlatform,
        contract_addresses: group.addresses,
        vs_currencies: ['usd'],
        include_24hr_change: true,
        include_24hr_vol: true,
        include_last_updated_at: true,
        include_market_cap: true,
      });

      for (const address in tokenPrices) {
        priceUpdates.push({
          updateOne: {
            filter: {
              address: address.toLowerCase(),
              assetPlatform: group.assetPlatform,
            },
            update: { $set: { cgTokenPrice: tokenPrices[address] } },
          },
        });
      }
    }

    await coinsModel.bulkWrite(priceUpdates);
    return _res.status(200).json({ success: true });
  } catch (error) {
    _next(error);
    return;
  }
}

export default priceUpdateController;
