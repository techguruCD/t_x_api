import mongoose from 'mongoose';
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

async function getFavCoin(params: { userId: string, skip?: number, limit?: number }) {
  if (params.skip === undefined) {
    params.skip = 0
  }

  if (params.limit === undefined) {
    params.limit = 10
  }

  const data = await favCoinsModel.aggregate([
    {
      $match: {
        userId: params.userId,
      },
    },
    {
      $facet: {
        cmcResults: [
          {
            $match: {
              platform: "cmc",
            },
          },
          {
            $lookup: {
              from: "CMCList",
              localField: "value",
              foreignField: "id",
              as: "cmcCoin",
            },
          },
          {
            $lookup: {
              from: "CMCMetadata",
              localField: "value",
              foreignField: "id",
              as: "cmcMetadata",
            },
          },
          {
            $unwind: {
              path: "$cmcCoin",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$cmcMetadata",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              id: {
                $ifNull: ["$cmcMetadata.id", null]
              },
              name: {
                $ifNull: ["$cmcMetadata.name", null]
              },
              logo: {
                $ifNull: ["$cmcMetadata.logo", null]
              },
              price: {
                $ifNull: ["$cmcCoin.quote.USD.price", null]
              },
              change: {
                $ifNull: ["$cmcCoin.quote.USD.percent_change_1h", null]
              },
              platform: "cmc",
              createdAt: 1,
            },
          },
        ],
        cgResults: [
          {
            $match: {
              platform: "cg",
            },
          },
          {
            $project: {
              id: {
                $ifNull: ["$cmcMetadata.id", null]
              },
              name: {
                $ifNull: ["$cmcMetadata.name", null]
              },
              logo: {
                $ifNull: ["$cmcMetadata.logo", null]
              },
              price: {
                $ifNull: ["$cmcCoin.quote.USD.price", null]
              },
              change: {
                $ifNull: ["$cmcCoin.quote.USD.percent_change_1h", null]
              },
              platform: "cmc",
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        mergedResults: {
          $concatArrays: [
            "$cmcResults",
            "$cgResults",
          ],
        },
      },
    },
    {
      $unwind: {
        path: "$mergedResults",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "mergedResults.id": { $ne: null }
      }
    },
    {
      $sort: {
        "mergedResults.createdAt": -1,
      },
    },
    {
      $group: {
        _id: null,
        favCoins: {
          $push: "$mergedResults",
        },
      },
    },
    {
      $skip: params.skip
    },
    {
      $limit: params.limit
    }
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
