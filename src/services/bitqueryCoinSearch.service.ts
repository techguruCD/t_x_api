import { is } from 'superstruct';
import bitqueryRequests from '../bitquery/requests';
import geckoRequests from '../geckoTerminal/requests';
import coinsModel from '../models/coins.model';
import { ValidWalletAddress } from '../validators/request.validator';

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

async function getPool(network: 'ethereum' | 'bsc', searchString: string) {
  let pair = null;
  try {
    pair = await geckoRequests.getPool({
      network: network === 'ethereum' ? 'eth' : 'bsc',
      address: searchString,
    });
  } catch (error) {
    console.log(`no pair found for address ${searchString}`);
  }

  return pair;
}

function prepareSearchQuery(network: 'ethereum' | 'bsc', searchString: string) {
  const regexPattern = new RegExp(searchString, 'i');

  return {
    network,
    $or: [
      { name: regexPattern },
      { symbol: regexPattern },
      { address: regexPattern },
    ],
  };
}

function getCoinSearchProjection() {
  return {
    network: 1,
    address: 1,
    name: 1,
    symbol: 1,
    decimals: 1,
    assetPlatform: 1,
    updatedAt: 1,
  };
}

async function coinSearchService(params: {
  network: 'ethereum' | 'bsc';
  string: string;
  limit?: number;
  offset?: number;
}) {
  const { network, string } = params;
  let pair = null;

  /**
   * If the string is valid wallet address
   * Search for pair, and if there is a pair,
   * return the pair because it cannot be a specific coin
   */
  if (is(string, ValidWalletAddress)) {
    // TODO: store pair in DB and first fetch it from db.
    pair = await getPool(network, string);

    if (pair) {
      return { ...pair, pair: true };
    }
  }

  /**
   * First, we search for the provided string in db.
   * If there is a match, we return all of the results.
   */
  const searchQuery = prepareSearchQuery(network, string);
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 10;

  const coinsInDb = await coinsModel
    .find(searchQuery, getCoinSearchProjection())
    .skip(offset)
    .limit(limit)
    .lean();

  if (coinsInDb.length > 0) {
    return coinsInDb;
  }

  /**
   * If there is no match or the length of coinsInDb is 0,
   * We continue the pagination and search for the coin from bitquery
   */
  const coinsFromBitquery = await bitqueryRequests.searchToken({
    network,
    string,
    limit,
    offset,
  });

  /**
   * Since, We had to query bitquery because no coins,
   * We should store all the coins retrieved from bitquery.
   * So, we can have data on our end next time.
   */
  await upsertCoins(coinsFromBitquery);
  return coinsFromBitquery;
}

export default coinSearchService;
