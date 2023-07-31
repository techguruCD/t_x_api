import cmcModel from '../models/cmc.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';

async function setFavCoin(params: { userId: string; platform: string, value: string | number }) {

  if (params.platform === 'cmc') {
    const coin = await cmcModel.CMCListModel.findOne({ id: params.value }).lean();

    if (!coin) {
      throw new ExpressError('CNF00001', "Coin Not Found", 404);
    }

    const favCoin = await favCoinsModel.findOne({ userId: params.userId, platform: "cmc", value: params.value }).lean();

    if (favCoin) {
      return { success: true };
    }

    await new favCoinsModel({
      userId: params.userId,
      platform: "cmc",
      value: params.value
    }).save();

    return { success: true };
  }

  return { success: false };
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
        assetPlatform: 1,
        image: '$cgMarketData.image',
        price: '$cgMarketData.current_price',
        priceChangeInPercentage:
          '$cgMarketData.price_change_percentage_24h',
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
