import { isAxiosError } from 'axios';
import { ExpressError } from '../utils/error.utils';
import cgAxios from './cgAxios';

// /simple/token_price/{id}
async function tokenPrice(params: {
  id: string;
  contract_addresses: string[];
}) {
  try {
    const url = `/simple/token_price/${params.id}`;
    const queryParams = {
      contract_addresses: params.contract_addresses.toString(),
      vs_currencies: 'usd',
      include_last_updated_at: 'true',
    };

    const cgResponse = await cgAxios.get(url, {
      params: queryParams,
    });
    return cgResponse.data;
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      throw new ExpressError(
        'CGE00001',
        error.response.data.error,
        error.response.status
      );
    }
    throw new ExpressError(
      'CGE00002',
      error.message ?? 'Something Went Wrong',
      400
    );
  }
}

// /coins/{id}/contract/{contract_address}
async function tokenInfoFromAddress(params: {
  id: string;
  contract_address: string;
}) {
  try {
    const url = `/coins/${params.id}/contract/${params.contract_address}`;

    const cgResponse = await cgAxios.get(url);
    return cgResponse.data;
  } catch (error: any) {
    return null;
  }
}

// /coins/{id}/contract/{contract_address}/market_chart/
async function marketChartFromAddress(params: {
  id: string;
  contract_address: string;
  vs_currency: string;
  days: string;
  precision?: string;
}) {
  try {
    const url = `/coins/${params.id}/contract/${params.contract_address}/market_chart/`;
    const queryParams = {
      vs_currency: params.vs_currency,
      days: params.days,
      precision: params.precision ?? 'full',
    };

    const cgResponse = await cgAxios.get(url, {
      params: queryParams,
    });
    return cgResponse.data;
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      throw new ExpressError(
        'CGE00005',
        error.response.data.error,
        error.response.status
      );
    }
    throw new ExpressError(
      'CGE00006',
      error.message ?? 'Something Went Wrong',
      400
    );
  }
}

// /coins/markets
async function coinMarketData(params: {
  ids: string[];
}) {
  try {

    if (params.ids.length < 1) {
      return [];
    }

    const url = `/coins/markets`;
    const queryParams: Record<string, string> = {
      ids: params.ids.toString(),
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: "250",
      sparkline: 'false',
      price_change_percentage: '1h',
      locale: 'en',
    };

    const cgResponse = await cgAxios.get(url, {
      params: queryParams,
    });
    return cgResponse.data;
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      throw new ExpressError(
        'CGE00007',
        error.response.data.error,
        error.response.status
      );
    }
    throw new ExpressError(
      'CGE00008',
      error.message ?? 'Something Went Wrong',
      400
    );
  }
}

// /coins/list
async function coinsList() {
  try {
    const url = `/coins/list`;

    const cgResponse = await cgAxios.get(url);
    return cgResponse.data;
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      throw new ExpressError(
        'CGE00009',
        error.response.data.error,
        error.response.status
      );
    }
    throw new ExpressError(
      'CGE00010',
      error.message ?? 'Something Went Wrong',
      400
    );
  }
}

const cgRequests = {
  tokenPrice,
  tokenInfoFromAddress,
  marketChartFromAddress,
  coinMarketData,
  coinsList
};

export default cgRequests;
