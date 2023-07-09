import { isAxiosError } from 'axios';
import { ExpressError } from '../utils/error.utils';
import bitqueryAxios from './bitqueryAxios';
import bitqueryStreamingAxios from './bitqueryStreamingAxios';
import queries from './queries';

function getAssetPlatform(network: string) {
  let assetPlatform = 'ethereum';

  if (network === 'bsc') {
    assetPlatform = 'binance-smart-chain';
  }

  return assetPlatform;
}

async function searchToken(params: {
  network: 'ethereum' | 'bsc';
  string: string;
}) {
  try {
    const { network, string } = params;
    const query = queries.searchTokenByString({
      network,
      string,
      limit: 10000,
      offset: 0,
    });
    const postData = JSON.stringify({ query: query, variables: {} });
    const data = await bitqueryAxios.post('/', postData);

    const search = data.data.data?.search;

    if (search && Array.isArray(search) && search.length > 0) {
      const filteredData = [];

      for (let c of search) {
        const network = c.network?.network;
        const address = c.subject?.address;
        const name = c.subject?.name;
        const symbol = c.subject?.symbol;
        const tokenType = c.subject?.tokenType;
        const decimals = c.subject?.decimals;

        if (
          !network ||
          !address ||
          !name ||
          !symbol ||
          !tokenType ||
          !decimals
        ) {
          continue;
        }

        filteredData.push({
          network,
          address,
          name,
          symbol,
          tokenType,
          decimals,
          assetPlatform: getAssetPlatform(network),
        });
      }
      return filteredData;
    }
    return [];
  } catch (error: any) {
    if (isAxiosError(error)) {
      throw new ExpressError('ST00001', error.response?.data, 400);
    }
    throw new ExpressError(
      'ST00002',
      error.message ?? 'Could not search coin',
      400
    );
  }
}

async function searchPairs(params: {
  network: 'ethereum' | 'bsc';
  currency: string;
  limit: number;
  offset: number;
}) {
  try {
    const { network, limit, offset, currency } = params;
    const query = queries.searchPairsByCurrency({
      network,
      currency,
      limit,
      offset,
    });
    const postData = JSON.stringify({ query: query, variable: {} });
    const data = await bitqueryAxios.post('/', postData);

    const pairs = data.data.data?.ethereum?.dexTrades;

    if (pairs && Array.isArray(pairs) && pairs.length > 0) {
      const filteredData = pairs.map((p: any) => {
        return {
          network,
          address: p.smartContract.address.address,
          baseCurrency: p.baseCurrency,
          quoteCurrency: p.quoteCurrency,
          quotePrice: p.quotePrice,
        };
      });
      return filteredData;
    }
    return [];
  } catch (error: any) {
    if (isAxiosError(error)) {
      return error.response ? error.response.data : null;
    }
    return { data: error.message };
  }
}

async function searchTokenPriceInUSD(params: {
  network: 'ethereum' | 'bsc';
  address: string;
}) {
  const query = queries.searchTokenPriceInUSD(params);
  const postData = JSON.stringify({ query, variables: {} });
  const data = await bitqueryAxios.post('/', postData);

  const price = data.data.data?.ethereum?.dexTrades;

  if (!price || !Array.isArray(price) || price.length < 1) {
    return null;
  }

  return Number(price[0].priceInUSD);
}

async function searchPairByAddress(params: {
  network: 'ethereum' | 'bsc';
  address: string;
}) {
  const query = queries.searchPairByAddress(params);
  const postData = JSON.stringify({ query, variables: {} });
  const data = await bitqueryStreamingAxios.post('/', postData);

  const dexTrades = data.data?.data?.EVM.DEXTrades;

  if (!dexTrades || !Array.isArray(dexTrades) || dexTrades.length < 1) {
    return [];
  }

  const trade = dexTrades[0];

  const pairData = {
    address: params.address,
    name: `${trade.Trade.Sell.Currency.Symbol}/${trade.Trade.Buy.Currency.Symbol}`,
    price: `${trade.Trade.Sell.Price}/${trade.Trade.Buy.Price}`,
  };

  return [pairData];
}

const bitqueryRequests = {
  searchToken,
  searchPairs,
  searchTokenPriceInUSD,
  searchPairByAddress,
};

export default bitqueryRequests;
