import coinsModel from '../models/coins.model';
import bitqueryRequests from '../bitquery/requests';
import geckoRequests from '../geckoTerminal/requests';

async function upsertCoins(coins: any[]) {
  const operations = coins.map((coin) => ({
    updateOne: {
      filter: { address: coin.address },
      update: { $set: coin },
      upsert: true,
    },
  }));

  await coinsModel.bulkWrite(operations);
}

async function coinSearchService(params: {
  network: 'ethereum' | 'bsc';
  string: string;
  limit?: number;
  offset?: number;
  fromBitquery: boolean;
}) {
  const { fromBitquery, network, string } = params;
  const regexPattern = new RegExp(params.string, 'i');
  const searchQuery = {
    network: params.network,
    $or: [
      { name: regexPattern },
      { symbol: regexPattern },
      { address: regexPattern },
    ],
  };
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 10;

  let pair = null;

  try {
    pair = await geckoRequests.getPool({
      network: params.network === 'ethereum' ? 'eth' : 'bsc',
      address: params.string,
    });
  } catch (error) {
    console.log(`no pair found for address ${params.string}`);
  }

  if (fromBitquery) {
    const coinsFromBitquery = await bitqueryRequests.searchToken({
      limit,
      network,
      offset,
      string,
    });
    const coins = coinsFromBitquery.map((coin: any) => {
      if (coin.tokenType) {
        delete coin.tokenType;
      }
      return {
        ...coin,
        assetPlatform:
          coin.network === 'bsc' ? 'binance-smart-chain' : 'ethereum',
      };
    });
    await upsertCoins(coins);
    if (pair) {
      coins.push(pair);
    }
    return coins;
  }

  const coinsInDb = await coinsModel
    .find(searchQuery, {
      network: 1,
      address: 1,
      name: 1,
      symbol: 1,
      decimals: 1,
      assetPlatform: 1,
      updatedAt: 1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  if (pair) {
    coinsInDb.push(pair as any);
  }

  return coinsInDb;
}

export default coinSearchService;
