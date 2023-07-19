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
          _id: null,
          ids: {
            $addToSet: "$coinInfo.cgMarketData.id",
          },
        }
      },
    ]);

    if (coinGroups.length < 1) {
      return _res.status(200).json({ success: true });
    }

    const ids = coinGroups[0].ids ?? [];

    const cgMarketData = await cgRequests.coinMarketData({ ids });

    const cgMarketUpdates = [];

    for (let i = 0; i < cgMarketData.length; i++) {
      const id = cgMarketData[i].id;
      cgMarketUpdates.push({
        updateOne: {
          filter: { "cgMarketData.id": id },
          update: { $set: { "cgMarketData": cgMarketData[i] } },
          upsert: true
        }
      })
    }

    if (cgMarketUpdates.length > 0) {
      await coinsModel.bulkWrite(cgMarketUpdates);
    }

    return _res.status(200).json({ success: true });
  } catch (error) {
    _next(error);
    return;
  }
}

export default priceUpdateController;
