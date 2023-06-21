import coinsModel from '../models/coins.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';

async function setFavCoin(params: { userId: string; address: string }) {
  const coin = await coinsModel
    .findOne({ address: params.address.toLowerCase() })
    .lean();

  if (!coin) {
    throw new ExpressError('CNF00001', 'Coin Not Found', 404);
  }

  const favCoin = await favCoinsModel
    .findOne({
      address: coin.address.toLowerCase(),
      userId: params.userId,
    })
    .lean();

  if (favCoin) {
    return { success: true };
  }

  await new favCoinsModel({
    address: params.address.toLowerCase(),
    userId: params.userId,
  }).save();

  return { success: true };
}

async function getFavCoin(params: {
  userId: string;
  address?: string;
  projection: {
    cgTokenPrice: boolean;
    cgTokenInfo: boolean;
    cgMarketChart: boolean;
    cgMarketData: boolean;
  };
}) {
  const projection: Record<string, number> = {
    _id: 1,
    address: 1,
    assetPlatform: 1,
    decimal: 1,
    name: 1,
    network: 1,
    symbol: 1,
  };

  if (params.projection.cgTokenPrice) {
    projection['cgTokenPrice'] = 1;
  }

  if (params.projection.cgTokenInfo) {
    projection['cgTokenInfo'] = 1;
  }

  if (params.projection.cgMarketChart) {
    projection['cgMarketChart'] = 1;
  }

  if (params.projection.cgMarketData) {
    projection['cgMarketData'] = 1;
  }

  const query: Record<string, any>[] = [
    {
      $match: {
        userId: params.userId,
      },
    },
    {
      $lookup: {
        from: 'Coins',
        localField: 'address',
        foreignField: 'address',
        as: 'info',
      },
    },
    {
      $unwind: {
        path: '$info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: projection,
    },
    {
      $replaceRoot: {
        newRoot: '$info',
      },
    },
    // {
    //   $group: {
    //     _id: '$assetPlatform',
    //     coins: {
    //       $push: '$$ROOT',
    //     },
    //   },
    // },
  ];

  if (params.address) {
    query[0]['$match']['address'] = params.address;
  }

  const data = await favCoinsModel.aggregate();
  return data;
}

async function removeFavCoin(params: { userId: string; addresses: string[] }) {
  const deleteOperations = params.addresses.map((address) => ({
    deleteOne: {
      filter: { address: address.toLowerCase(), userId: params.userId },
    },
  }));

  const result = await favCoinsModel.bulkWrite(deleteOperations);
  return { success: result.isOk() };
}

const coinFavService = {
  setFavCoin,
  getFavCoin,
  removeFavCoin,
};

export default coinFavService;
