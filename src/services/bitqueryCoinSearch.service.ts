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
  const { network, string } = params;
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

  if (coinsInDb.length < 1) {
    const coinsFromBitquery = await bitqueryRequests.searchToken({
      limit,
      network,
      offset,
      string,
    });
    const filteredCoins = coinsFromBitquery.map((coin: any) => {
      return {
        ...coinsFromBitquery,
        assetPlatform:
          coin.network === 'bsc' ? 'binance-smart-chain' : 'ethereum',
      };
    });
    await upsertCoins(filteredCoins);
    if (pair) {
      filteredCoins.push(pair);
    }
    return filteredCoins;
  }

  return coinsInDb;
}

export default coinSearchService;
