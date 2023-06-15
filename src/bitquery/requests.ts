import { isAxiosError } from 'axios';
import bitqueryAxios from './bitqueryAxios';
import queries from './queries';

async function searchToken(params: {
  network: 'ethereum' | 'bsc';
  string: string;
  limit: number;
  offset: number;
}) {
  try {
    const { network, string, limit, offset } = params;
    const query = queries.searchTokenByString({
      network,
      string,
      limit,
      offset,
    });
    const postData = JSON.stringify({ query: query, variables: {} });
    const data = await bitqueryAxios.post('/', postData);

    const search = data.data.data?.search;

    if (search && Array.isArray(search) && search.length > 0) {
      const filteredData = search.map((s: any) => {
        return {
          network: s.network.network,
          address: s.subject.address,
          name: s.subject.name,
          symbol: s.subject.symbol,
          tokenType: s.subject.tokenType,
          decimals: s.subject.decimals,
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

export default {
  searchToken,
  searchPairs,
};