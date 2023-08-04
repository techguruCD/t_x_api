import bqModel from '../models/bq.model';
import cmcModel from '../models/cmc.model';
import favCoinsModel from '../models/favCoins.model';

async function coinSearch(params: { searchTerm: string, skip?: number, limit?: number }) {
  if (params.skip === undefined) {
    params.skip = 0
  }

  if (params.limit === undefined) {
    params.limit = 10;
  }

  const searchObjectWithRegex = { $regex: params.searchTerm, $options: "i" }
  const results = await cmcModel.CMCMetadataModel.aggregate([
    {
      $match: {
        $or: [
          { name: searchObjectWithRegex },
          { slug: searchObjectWithRegex },
          { symbol: searchObjectWithRegex },
          { tags: { $elemMatch: searchObjectWithRegex } },
          { "tag-groups": { $elemMatch: searchObjectWithRegex } },
          { "tag-names": { $elemMatch: searchObjectWithRegex } },
          { "platform.token_address": searchObjectWithRegex },
          { "contract_address.contract_address": searchObjectWithRegex },
        ],
      },
    },
    { $lookup: { from: "CMCList", localField: "id", foreignField: "id", as: "cmcCoin" } },
    { $unwind: { path: "$cmcCoin", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        id: "$id",
        name: "$name",
        logo: "$logo",
        price: "$cmcCoin.quote.USD.price",
        change: "$cmcCoin.quote.USD.percent_change_1h",
        platform: "cmc",
        updatedAt: "$updatedAt",
        network: null,
        type: "token",
        cmc_rank: "$cmcCoin.cmc_rank",
      }
    },
    { $sort: { cmc_rank: 1 } },
    { $project: { _id: 0, cmc_rank: 0 } }
  ]).unionWith({
    coll: 'BQList',
    pipeline: [
      {
        $match: {
          $or: [
            { "currency.address": searchObjectWithRegex },
            { "currency.name": searchObjectWithRegex },
            { "currency.symbol": searchObjectWithRegex },
            { "currency.tokenId": searchObjectWithRegex },
            { "currency.tokenType": searchObjectWithRegex },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          id: "$currency.address",
          name: "$currency.name",
          logo: null,
          price: null,
          change: null,
          platform: null,
          updatedAt: "$updatedAt",
          network: "$network",
          type: "token",
        },
      },
      { $sort: { count: -1 } },
    ]
  }).unionWith({
    coll: 'BQPair',
    pipeline: [
      {
        $match: {
          $or: [
            { "smartContract.address.address": searchObjectWithRegex },
            { "smartContract.currency.name": searchObjectWithRegex },
            { "smartContract.currency.symbol": searchObjectWithRegex },
            { "smartContract.currency.tokenType": searchObjectWithRegex },
            { "exchange.address.address": searchObjectWithRegex },
            { "exchange.fullName": searchObjectWithRegex },
            { "exchange.fullNameWithId": searchObjectWithRegex },
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
          price: null,
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
            {
              type: "chat",
              values: "$urls.chat"
            },
            {
              type: "facebook",
              values: "$urls.facebook"
            },
            {
              type: "explorer",
              values: "$urls.explorer"
            },
            {
              type: "reddit",
              values: "$urls.reddit"
            },
            {
              type: "technical_doc",
              values: "$urls.technical_doc"
            },
            {
              type: "announcement",
              values: "$urls.announcement"
            },
          ],
          chart: [],
          platform: "cmc"
        },
      },
      { $limit: 1 }
    ])

    if (cmcCoin.length < 1) {
      return data;
    }

    const isFav = await favCoinsModel.exists({ platform: "cmc", value: params.value, userId: params.userId }).lean();
    cmcCoin[0].isFav = isFav?._id.toString() ?? null;

    data['info'] = cmcCoin[0];

  }

  if (params.platform === 'DEX' && params.type === 'token') {
    if (!params.tokenPairSkip) {
      params.tokenPairSkip = 0
    }

    const bqCoin = await bqModel.BQListModel.aggregate([
      { $match: { "currency.address": params.value } },
      {
        $project: {
          _id: 0,
          id: "$currency.address",
          name: "$currency.name",
          logo: null,
          description: null,
          price: null,
          priceChange: null,
          urls: [],
          chart: [],
          platform: "DEX",
        },
      },
      {
        $lookup: {
          from: "BQPair",
          let: { address: "$id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$buyCurrency.address", "$$address"] } } },
            { $skip: params.tokenPairSkip },
            { $limit: 10 },
            {
              $project: {
                id: "$smartContract.address.address",
                name: { $concat: ["$buyCurrency.symbol", "/", "$sellCurrency.symbol"] },
                logo: null,
                price: null,
                change: null,
                platform: "DEX",
                updated: "$updatedAt",
                network: "$network",
                type: "pair",
                exchange: "$exchange.fullName",
              },
            },
          ],
          as: "pairs",
        },
      },
      { $limit: 1 }
    ]);

    if (bqCoin.length < 1) {
      return data;
    }

    const isFav = await favCoinsModel.exists({ platform: "DEX", value: params.value, userId: params.userId }).lean();
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
  coinSearch,
  getCoinInfo,
  getTop100,
};

export default coinService;
