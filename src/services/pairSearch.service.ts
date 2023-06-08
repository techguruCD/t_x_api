import bitqueryRequests from '../bitquery/requests';
import coinsModel from '../models/coins.model';
import pairsModel from '../models/pairs.model';

async function upsertCoinsAndPairs(pairData: any[]) {
  const coins: any[] = [];
  const pairs = [];

  for (const pair of pairData) {
    const { network, address, baseCurrency, quoteCurrency, quotePrice } = pair;

    const baseCoin = coins.find(
      (e) => e.updateOne.filter.address === baseCurrency.address
    );
    const quoteCoin = coins.find(
      (e) => e.updateOne.filter.address === quoteCurrency.address
    );

    if (!baseCoin) {
      coins.push({
        updateOne: {
          filter: { address: baseCurrency.address },
          update: { $set: { network, ...baseCurrency } },
          upsert: true,
        },
      });
    }

    if (!quoteCoin) {
      coins.push({
        updateOne: {
          filter: { address: quoteCurrency.address },
          update: { $set: { network, ...quoteCurrency } },
          upsert: true,
        },
      });
    }

    pairs.push({
      updateOne: {
        filter: { address },
        update: {
          $set: {
            network,
            address,
            baseCurrency: baseCurrency.address,
            quoteCurrency: quoteCurrency.address,
            quotePrice: String(quotePrice),
          },
        },
        upsert: true,
      },
    });

    await Promise.all([
      coinsModel.bulkWrite(coins),
      pairsModel.bulkWrite(pairs),
    ]);
  }
}

async function pairSearchService(params: {
  network: 'ethereum' | 'bsc';
  currency: string;
  limit?: number;
  offset?: number;
  fromBitquery: boolean;
}) {
  const { fromBitquery, network, currency } = params;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 10;

  if (fromBitquery) {
    const pairsFromBitquery = await bitqueryRequests.searchPairs({
      currency,
      limit,
      network,
      offset,
    });

    await upsertCoinsAndPairs(pairsFromBitquery);
    return pairsFromBitquery;
  }

  const pairsInDb = await pairsModel.aggregate([
    {
      $match: {
        $or: [
          {
            baseCurrency: currency,
          },
          {
            quoteCurrency: currency,
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'Coins',
        localField: 'baseCurrency',
        foreignField: 'address',
        as: 'baseCurrency',
      },
    },
    {
      $addFields: {
        baseCurrency: {
          $arrayElemAt: ['$baseCurrency', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'Coins',
        localField: 'quoteCurrency',
        foreignField: 'address',
        as: 'quoteCurrency',
      },
    },
    {
      $addFields: {
        quoteCurrency: {
          $arrayElemAt: ['$quoteCurrency', 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        'quoteCurrency._id': 0,
        'baseCurrency._id': 0,
      },
    },
    {
      $skip: offset,
    },
    {
      $limit: limit,
    },
  ]);
  return pairsInDb;
}

export default pairSearchService;
