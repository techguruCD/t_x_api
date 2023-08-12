import mongoose from 'mongoose';
import favCoinsModel from '../models/favCoins.model';

async function setFavCoin(params: { userId: string; platform: string, value: string, type: string }) {

  const favObject = {
    userId: String(params.userId),
    platform: params.platform === 'cg' ? 'cg' : 'DEX',
    type: params.type === 'token' ? 'token' : 'pair',
    value: String(params.value)
  }
    const favCoin = await favCoinsModel.findOne(favObject);
    
    if (favCoin) {
      return { success: true };
    }

    await new favCoinsModel(favObject).save();

    return { success: true };
}

async function getFavCoin(params: { userId: string, skip?: number, limit?: number }) {
  if (params.skip === undefined) {
    params.skip = 0
  }

  if (params.limit === undefined) {
    params.limit = 10
  }

  const data = await favCoinsModel.aggregate([
    { $match: { userId: params.userId } },
    {
      $facet: {
        cgTokens: [
          { $match: { platform: "cg", type: "token" } },
          { $lookup: { from: "CGInfo", localField: "value", foreignField: "id", as: "cgCoin" } },
          { $unwind: { path: "$cgCoin", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$cgCoin.id",
              market_cap_rank:
                "$cgCoin.market_cap_rank",
              name: "$cgCoin.name",
              logo: "$cgCoin.image",
              price: "$cgCoin.current_price",
              change: {
                $round: [
                  "$cgCoin.price_change_percentage_24h",
                  4,
                ],
              },
              platform: "cg",
              type: "token",
              network: null,
              updatedAt: 1,
            },
          },
        ],
        dexTokens: [
          { $match: { platform: "DEX", type: "token" } },
          {
            $lookup: {
              from: "BQPair",
              let: { address: "$value" },
              pipeline: [{ $match: { $expr: { $eq: ["$buyCurrency.address", "$$address"] } } }, { $limit: 1 }],
              as: "bqCoin",
            },
          },
          { $unwind: { path: "$bqCoin", preserveNullAndEmptyArrays: false } },
          {
            $project: {
              id: "$bqCoin.buyCurrency.address",
              name: "$bqCoin.buyCurrency.name",
              logo: null,
              price: { $toDouble: "$bqCoin.buyCurrencyPrice" },
              change: null,
              platform: "DEX",
              address: "$bqCoin.buyCurrency.address",
              decimals: "$bqCoin.buyCurrency.decimals",
              symbol: "$bqCoin.buyCurrency.symbol",
              tokenId: "$bqCoin.buyCurrency.tokenId",
              tokenType: "$bqCoin.buyCurrency.tokenType",
              network: "network",
              type: "token",
              updatedAt: 1,
            },
          },
        ],
        dexPairs: [
          { $match: { platform: "DEX", type: "pair"} },
          {
            $lookup: {
              from: "BQPair",
              let: { address: "$value" },
              pipeline: [
                { $match: { $expr: { $eq: ["$smartContract.address.address", "$$address"] } } },
                { $limit: 1 },
              ],
              as: "bqPair",
            },
          },
          { $unwind: { path: "$bqPair", preserveNullAndEmptyArrays: false } },
          {
            $project: {
              id: "$bqPair.smartContract.address.address",
              name: { $concat: ["$bqPair.buyCurrency.symbol","/","$bqPair.sellCurrency.symbol"] },
              logo: null,
              price: { $toDouble: "$bqPair.buyCurrencyPrice" },
              change: null,
              platform: "DEX",
              network: "$network",
              type: "pair",
              exchange: "$bqPair.exchange.fullName",
              updatedAt: 1,
            },
          },
        ],
      },
    },
    { $project: { mergedResult: { $concatArrays: ["$cgTokens", "$dexTokens", "$dexPairs" ] } } },
    { $unwind: { path: "$mergedResult", preserveNullAndEmptyArrays: false } },
    { $sort: { "mergedResult.updatedAt": -1 } },
    { $group: { _id: null, favCoins: { $push: "$mergedResult" } } },
    { $skip: 0 },
    { $limit: 10 },
  ]);

  if (data.length < 1) {
    return []
  }
  
  return data[0].favCoins;
}

async function removeFavCoin(params: { userId: string; _ids: string[] }) {
  const deleteOperations = params._ids.map((_id) => ({
    deleteOne: {
      filter: { _id: new mongoose.Types.ObjectId(_id), userId: params.userId },
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
