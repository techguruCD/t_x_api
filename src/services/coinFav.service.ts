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

async function getFavCoin(params: { userId: string }) {
  const data = await favCoinsModel.aggregate([
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
      $replaceRoot: {
        newRoot: '$info',
      },
    },
    {
      $project: {
        address: 1,
        name: 1,
        image: '$cgMarketData.image',
        price: '$cgTokenPrice.usd',
        priceChangeInPercentage:
          '$cgMarketData.price_change_percentage_1h_in_currency',
        updatedAt: 1,
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
