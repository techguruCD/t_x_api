import { ExpressError } from '../utils/error.utils';
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
          { "platform.token_address": params.searchTerm },
          { "contract_address.contract_address": params.searchTerm },
        ],
      },
    },
    { $lookup: { from: "CMCList", localField: "id", foreignField: "id", as: "cmcCoin" } },
    { $unwind: { path: "$cmcCoin", preserveNullAndEmptyArrays: true } },
    {
      $project: {
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
            { "currency.address": params.searchTerm },
            { "currency.name": searchObjectWithRegex },
            { "currency.symbol": searchObjectWithRegex },
            { "currency.tokenId": params.searchTerm },
            { "currency.tokenType": params.searchTerm },
          ],
        },
      },
      {
        $project: {
          id: "$_id",
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
        $lookup: {
          from: "BQList",
          localField: "baseCurrency",
          foreignField: "currency.address",
          as: "baseCurrency",
        },
      },
      { $unwind: { path: "$baseCurrency", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "BQList",
          localField: "quoteCurrency",
          foreignField: "currency.address",
          as: "quoteCurrency",
        },
      },
      { $unwind: { path: "$quoteCurrency", preserveNullAndEmptyArrays: false },
      },
      {
        $project: {
          _id: 1,
          network: 1,
          pairContract: 1,
          baseCurrency: "$baseCurrency.currency",
          dexToolSlug: 1,
          dexTrades: 1,
          exchange: 1,
          quoteCurrency: "$quoteCurrency.currency",
        },
      },
      {
        $match: {
          $or: [
            // { "baseCurrency.address": params.searchTerm },
            // { "baseCurrency.name": searchObjectWithRegex },
            // { "baseCurrency.symbol": searchObjectWithRegex },
            // { "baseCurrency.tokenId": params.searchTerm },
            // { "baseCurrency.tokenType": params.searchTerm },
            // { "quoteCurrency.address": params.searchTerm },
            // { "quoteCurrency.name": searchObjectWithRegex },
            // { "quoteCurrency.symbol": searchObjectWithRegex },
            // { "quoteCurrency.tokenId": params.searchTerm },
            // { "quoteCurrency.tokenType": params.searchTerm },
            { "exchange.address": params.searchTerm },
            { "pairContract.address": params.searchTerm },
            { "pairContract.currency.name": searchObjectWithRegex },
            { "pairContract.currency.symbol": searchObjectWithRegex },
            { "pairContract.currency.tokenType":  params.searchTerm },
            { "exchange.fullName": searchObjectWithRegex },
            { "exchange.fullNameWithId": searchObjectWithRegex },
            { "exchange.name": searchObjectWithRegex },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: { $concat: [ "$baseCurrency.symbol", "/", "$quoteCurrency.symbol" ] },
          logo: null,
          price: null,
          change: null,
          platform: "bitquery",
          updatedAt: "$updatedAt",
          network: "$network",
          type: "pair",
        },
      },
    ]
  }).skip(params.skip).limit(params.limit);

  return results;
}

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
      throw new ExpressError('CSE00002', 'coin info not found', 404);
    }

    const isFav = await favCoinsModel.exists({ platform: "cmc", value: params.value, userId: params.userId }).lean();
    cmcCoin[0].isFav = isFav?._id.toString() ?? null

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
  coinSearch,
  getCoinInfo,
  getTop100,
};

export default coinService;
