import bqModel from '../models/bq.model';
import cgModel from '../models/cg.model';
import favCoinsModel from '../models/favCoins.model';

async function coinSearch(params: { searchTerm: string, skip?: number, limit?: number }) {
  if (params.skip === undefined) {
    params.skip = 0
  }

  if (params.limit === undefined) {
    params.limit = 10;
  }

  const regexSearch = { $regex: `^${params.searchTerm}$`, $options: "i" };

  const results = await cgModel.CGListModel.aggregate([
    { $match: { $or: [{ symbol: regexSearch }, { name: regexSearch }, { id: regexSearch }] } },
    {
      $project: {
        id: 1,
        market_cap_rank: 1,
        name: 1,
        logo: "$image",
        price: "$current_price",
        change: { $round: ["$price_change_percentage_1h_in_currency", 4] },
        platform: "cg",
        type: "token",
        network: null,
      },
    },
  ]).unionWith({
    coll: 'BQPair',
    pipeline: [
      {
        $group: {
          _id: "$buyCurrency.address",
          id: { $first: "$buyCurrency.address" },
          name: { $first: "$buyCurrency.name" },
          logo: { $first: null },
          price: { $first: { $toDouble: "$buyCurrencyPrice" } },
          change: { $first: null },
          platform: { $first: "DEX" },
          address: { $first: "$buyCurrency.address" },
          decimals: { $first: "$buyCurrency.decimals" },
          symbol: { $first: "$buyCurrency.symbol" },
          tokenId: { $first: "$buyCurrency.tokenId" },
          tokenType: { $first: "$buyCurrency.tokenType" },
          network: { $first: "$network" },
          type: { $first: "token" },
        },
      },
      {
        $match: {
          $or: [
            { address: regexSearch },
            { symbol: regexSearch },
            { name: regexSearch },
            { tokenId: regexSearch },
            { tokenType: regexSearch },
          ],
        },
      },
    ]
  }).unionWith({
    coll: 'BQPair',
    pipeline: [
      {
        $match: {
          $or: [
            { "smartContract.address.address": regexSearch },
            { "smartContract.currency.name": regexSearch },
            { "smartContract.currency.symbol": regexSearch },
            { "smartContract.currency.tokenType": regexSearch },
            { "exchange.address.address": regexSearch },
            { "exchange.fullName": regexSearch },
            { "exchange.fullNameWithId": regexSearch },
          ],
        },
      },
      { $sort: { tradeAmount: -1 } },
      {
        $project: {
          _id: 0,
          id: "$smartContract.address.address",
          name: { $concat: [ "$buyCurrency.symbol", "/", "$sellCurrency.symbol" ] },
          logo: null,
          price: {
            $toDouble: "$buyCurrencyPrice"
          },
          change: null,
          platform: "DEX",
          updatedAt: "$updatedAt",
          network: "$network",
          type: "pair",
          exchange: "$exchange.fullName",
        },
      },
    ]
  }).skip(params.skip).limit(params.limit);

  return results;
}

async function getCoinInfo(params: {
  userId: string,
  platform: string,
  value: number | string,
  type: 'token' | 'pair',
  tokenPairSkip: number
}) {
  let data: Record<string, any> = { info: null }

  if (params.platform === "cg") {
    const cgCoin = await cgModel.CGCoinInfoModel.aggregate([
      {
        $match: {
          id: params.value,
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
          logo: "$image.large",
          description: "$description.en",
          price: "$current_price",
          urls: [
            {
              type: "website",
              values: "$links.homepage",
            },
            {
              type: "twitter",
              values: ["$links.twitter_screen_name"],
            },
            {
              type: "message_board",
              values: "$links.official_forum_url",
            },
            {
              type: "chat",
              values: "$links.chat_url",
            },
            {
              type: "facebook",
              values: ["$links.facebook_username"],
            },
            {
              type: "explorer",
              values: "$links.blockchain_site",
            },
            {
              type: "reddit",
              values: ["$links.subreddit_url"],
            },
            {
              type: "technical_doc",
              values: [],
            },
            {
              type: "telegram",
              values: [
                "$links.telegram_channel_identifier",
              ],
            },
            {
              type: "source_code",
              values: {
                $concatArrays: [
                  "$links.repos_url.github",
                  "$links.repos_url.bitbucket",
                ],
              },
            },
            {
              type: "announcement",
              values: "$links.announcement_url",
            },
          ],
          chart: [],
          platform: "cg",
          type: "token",
        },
      },
      {
        $lookup: {
          from: "CGList",
          localField: "id",
          foreignField: "id",
          as: "change",
        },
      },
      {
        $unwind: {
          path: "$change",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          price: "$change.current_price",
          priceChange: {
            $round: [
              "$change.price_change_percentage_1h_in_currency",
              4,
            ],
          },
        },
      },
      {
        $project: {
          change: 0,
        },
      },
    ]);

    if (cgCoin.length < 1) {
      return data;
    }

    const isFav = await favCoinsModel.exists({ platform: "cg", value: params.value, userId: params.userId, type: 'token' }).lean();
    cgCoin[0].isFav = isFav?._id.toString() ?? null;

    data['info'] = cgCoin[0];

  }

  if (params.platform === 'DEX' && params.type === 'token') {
    if (!params.tokenPairSkip) {
      params.tokenPairSkip = 0
    }

    const bqCoin = await bqModel.BQPairModel.aggregate([
      { $match: { "buyCurrency.address": params.value } },
      {
        $project: {
          _id: 0,
          id: "$buyCurrency.address",
          name: "$buyCurrency.name",
          logo: null,
          description: null,
          price: { $toDouble: "$buyCurrencyPrice" },
          priceChange: null,
          urls: [],
          chart: [],
          platform: "DEX",
        },
      },
    ]);

    if (bqCoin.length < 1) {
      return data;
    }

    const isFav = await favCoinsModel.exists({ platform: "DEX", value: params.value, userId: params.userId, type: "token" }).lean();
    bqCoin[0].isFav = isFav?._id.toString() ?? null;

    data['info'] = bqCoin[0];
  }

  if (params.platform === 'DEX' && params.type === 'pair') {
    const bqPair = await bqModel.BQPairModel.aggregate([
      { $match: { "smartContract.address.address": params.value } },
      {
        $project: {
          id: "$smartContract.address.address",
          name: { $concat: ["$buyCurrency.symbol", "/", "$sellCurrency.symbol"] },
          logo: null,
          change: null,
          platform: "DEX",
          updatedAt: "$updatedAt",
          network: "$network",
          type: "pair",
          count: "$count",
          tradeAmount: "$tradeAmount",
          pairContractAddress:
            "$smartContract.address.address",
          protocolType: "$smartContract.protocolType",
          exchange: "$exchange.fullName",
          exchnageContractAddress:
            "$exchange.address.address",
        },
      }
    ]);

    if (bqPair.length < 1) {
      return data;
    }

    const info: Record<string, any> = {
      id: bqPair[0].id,
      name: bqPair[0].name,
      logo: bqPair[0].logo,
      price: null,
      change: bqPair[0].change,
      platform: bqPair[0].platform,
      network: bqPair[0].network,
      type: bqPair[0].type,
      pairContractAddress: bqPair[0].pairContractAddress,
      protocolType: bqPair[0].protocolType,
      exchange: bqPair[0].exchange,
      exchangeContractAddress: bqPair[0].exchangeContractAddress,
      buy: {
        name: bqPair[0].name,
        trades: bqPair[0].count,
        tradeAmount: bqPair[0].tradeAmount,
      },
      sell: null,
      isFav: null
    }
    
    if (bqPair[1]) {
      info['sell'] = {
        name: bqPair[1].name,
        count: bqPair[1].count,
        tradeAmount: bqPair[1].tradeAmount
      };
    }

    const isFav = await favCoinsModel.exists({ platform: 'DEX', value: params.value, userId: params.userId }).lean();
    info['isFav'] = isFav?._id.toString() ?? null;
    
    data['info'] = info;
  }

  return data;
}

async function getTop100() {
  const top100 = await cgModel.CGListModel.aggregate([
  { $match: { market_cap_rank: { $ne: null } } },
  { $sort: { market_cap_rank: 1 } },
  { $limit: 100 },
  {
    $project: {
      id: 1,
      market_cap_rank: 1,
      name: 1,
      logo: "$image",
      price: "$current_price",
      change: { $round: ["$price_change_percentage_1h_in_currency", 4] },
      platform: "cg",
      type: "token",
    },
  },
]);

  return top100;
}

const coinService = {
  coinSearch,
  getCoinInfo,
  getTop100,
};

export default coinService;
