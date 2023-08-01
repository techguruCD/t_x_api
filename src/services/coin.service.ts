import { ExpressError } from '../utils/error.utils';
import cmcModel from '../models/cmc.model';

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
    { $unwind: { path: "$contract_address", preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: { id: "$id", contract_address: "$contract_address.contract_address" },
        id: { $first: "$id" },
        name: { $first: "$name" },
        logo: { $first: "$logo" },
        price: { $first: "$cmcCoin.quote.USD.price" },
        change: { $first: "$cmcCoin.quote.USD.percent_change_1h" },
        contract_address: { $first: "$contract_address.contract_address" },
        platform: { $first: "cmc" },
        cmc_rank: { $first: "$cmcCoin.cmc_rank" },
        updatedAt: { $first: "$updatedAt" }
      },
    },
    { $sort: { cmc_rank: 1 } },
    { $project: { _id: 0, cmc_rank: 0 } }
  ]).skip(params.skip).limit(params.limit);

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
  coinSearch,
  getCoinInfo,
  getTop100,
};

export default coinService;
