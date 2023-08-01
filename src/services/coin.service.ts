import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';
import bitqueryRequests from '../bitquery/requests';
import cmcModel from '../models/cmc.model';

async function getCoinInfo(params: { userId: string, platform: string, value: number | string }) {
  let data: Record<string, any> = { info: null }

  if (params.platform === "cmc") {
    const cmcCoin = await cmcModel.CMCMetadataModel.aggregate([
      { $match: { id: params.value } },
      {
        $lookup: {
          from: "CMCList",
          localField: "id",
          foreignField: "id",
          as: "coinList",
        },
      },
      {
        $unwind:
        {
          path: "$coinList",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
          logo: 1,
          description: 1,
          price: "$coinList.quote.USD.price",
          priceChange:
            "$coinList.quote.USD.percent_change_1h",
          urls: [
            {
              type: "website",
              values: "$urls.website",
            },
            {
              type: "x",
              values: "$urls.twitter",
            },
            {
              type: "source_code",
              values: "$urls.source_code",
            },
          ],
          chart: [],
          platform: "cmc"
        },
      },
      { $limit: 1 }
    ])

    if (!cmcCoin) {
      throw new ExpressError('CSE00002', 'coin info not found', 404);
    }

    data['info'] = cmcCoin[0];

  }

  if (params.platform === "cg") {
    data['info'] = { platform: "cg" }
  }

  return data;
}

async function getTop100() {
  const top100 = await cmcModel.CMCListModel.aggregate([
    { $sort: { cmc_rank: 1, } },
    { $limit: 100 },
    {
      $project: {
        id: 1,
        cmc_rank: 1,
        name: 1,
        platform: 1,
        "quote.USD": 1,
      },
    },
    {
      $lookup: {
        from: "CMCMetadata",
        localField: "id",
        foreignField: "id",
        as: "metadata",
      },
    },
    {
      $unwind: {
        path: "$metadata",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: 1,
        cmc_rank: 1,
        name: 1,
        logo: "$metadata.logo",
        price: "$quote.USD.price",
        change: "$quote.USD.percent_change_1h",
        platform: "cmc"
      },
    },
  ]);

  return top100;
}

const coinService = {
  getCoinInfo,
  getTop100,
};

export default coinService;
