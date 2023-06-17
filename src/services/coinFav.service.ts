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

  const { address, network } = coin;

  let assetPlatform = 'ethereum';

  if (network === 'bsc') {
    assetPlatform = 'binance-smart-chain';
  }

  const favCoin = await favCoinsModel
    .findOne({
      address: address.toLowerCase(),
      assetPlatform: assetPlatform,
      userId: params.userId,
    })
    .lean();

  if (favCoin) {
    return favCoin;
  }

  const newFavCoin = await new favCoinsModel({
    address: params.address.toLowerCase(),
    assetPlatform,
    userId: params.userId,
  }).save();

  return newFavCoin.toObject();
}

async function getFavCoin(params: {
  userId: string;
  address?: string;
  tokenPrice?: boolean;
  tokenInfo?: boolean;
  marketChart?: boolean;
  marketData?: boolean;
}) {
  const projection: Record<string, number> = {
    userId: 1,
    address: 1,
    assetPlatform: 1,
  };

  if (params.tokenPrice) {
    projection['cgTokenPrice'] = 1;
  }

  if (params.tokenInfo) {
    projection['cgTokenInfo'] = 1;
  }

  if (params.marketChart) {
    projection['cgMarketChart'] = 1;
  }

  if (params.marketData) {
    projection['cgMarketData'] = 1;
  }

  if (params.address) {
    const data = await favCoinsModel
      .findOne(
        { userId: params.userId, address: params.address.toLowerCase() },
        projection
      )
      .lean();
    return data;
  }

  const data = await favCoinsModel.aggregate([
    {
      $match: {
        userId: params.userId,
      },
    },
    {
      $project: projection,
    },
    {
      $group: {
        _id: '$assetPlatform',
        coins: {
          $push: '$$ROOT',
        },
      },
    },
  ]);

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
