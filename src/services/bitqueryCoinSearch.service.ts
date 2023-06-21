import coinsModel from '../models/coins.model';
import bitqueryRequests from '../bitquery/requests';

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
    return coins;
  }

  const coinsInDb = await coinsModel
    .find(searchQuery)
    .skip(offset)
    .limit(limit)
    .lean();

  return coinsInDb;
}

export default coinSearchService;
