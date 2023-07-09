import { is } from 'superstruct';
import bitqueryRequests from '../bitquery/requests';
import geckoRequests from '../geckoTerminal/requests';
import coinsModel from '../models/coins.model';
import { ValidWalletAddress } from '../validators/request.validator';
import pairsModel from '../models/pairs.model';

function prepareSearchQuery(network: 'ethereum' | 'bsc', searchString: string) {
  const regexPattern = new RegExp(searchString, 'i');

  return {
    network,
    $or: [{ name: regexPattern }, { symbol: regexPattern }],
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

async function upsertCoins(coins: any[]) {
  const operations = coins.map((coin) => ({
    updateOne: {
      filter: {
        address: String(coin.address).toLowerCase(),
        network: coin.network,
        name: coin.name,
        symbol: coin.symbol,
        decimals: coin.decimals,
        assetPlatform: coin.assetPlatform,
      },
      update: { $set: coin },
      upsert: true,
    },
  }));

  await coinsModel.bulkWrite(operations);
}

async function getPool(network: 'ethereum' | 'bsc', searchString: string) {
  let pair = null;
  const address = searchString.toLowerCase();
  try {
    const pairInDb = await pairsModel.findOne({ network, address }).lean();

    if (pairInDb) {
      return {
        address: pairInDb.address,
        name: pairInDb.name,
        price: pairInDb.quotePrice,
      };
    }

    pair = await geckoRequests.getPool({
      network: network === 'ethereum' ? 'eth' : 'bsc',
      address,
    });

    if (pair) {
      await new pairsModel({
        network,
        name: pair.name,
        address,
        baseCurrency: String(pair.base).toLowerCase(),
        quoteCurrency: String(pair.quote).toLowerCase(),
        quotePrice: pair.price,
      }).save();
    }
  } catch (error) {
    console.log(`no pair found for address ${searchString}`);
  }

  if (pair) {
    delete pair.base;
    delete pair.quote;
  }
  return pair;
}

async function addressSearch(network: 'ethereum' | 'bsc', address: string) {
  const coinInDb = await coinsModel.find({ address, network }).lean();
  if (coinInDb.length > 0) {
    return coinInDb;
  }

  const coinFromBitquery = await bitqueryRequests.searchToken({
    network,
    string: address,
  });

  if (coinFromBitquery.length > 0) {
    await upsertCoins(coinFromBitquery);
  }

  return coinFromBitquery;
}

async function syncFromBitquery(
  network: 'ethereum' | 'bsc',
  searchString: string
) {
  try {
    const coinsFromBitquery = await bitqueryRequests.searchToken({
      network,
      string: searchString,
    });

    await upsertCoins(coinsFromBitquery);
  } catch (error) {
    console.log(`Sync Fail for ${searchString} on ${network} network`);
  }
}

async function coinSearchService(params: {
  network: 'ethereum' | 'bsc';
  string: string;
}) {
  const { network, string } = params;
  let pair = null;

  if (is(string, ValidWalletAddress)) {
    pair = await getPool(network, string);

    if (pair) {
      return [{ ...pair, pair: true }];
    }

    const data = await addressSearch(network, string);
    return data;
  }

  const searchQuery = prepareSearchQuery(network, string);
  await syncFromBitquery(network, string);

  const coinsInDb = await coinsModel
    .find(searchQuery, getCoinSearchProjection())
    .lean();

  return coinsInDb;
}

export default coinSearchService;
