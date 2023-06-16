import { isAxiosError } from 'axios';
import { ExpressError } from '../utils/error.utils';
import cgAxios from './cgAxios';

// /simple/token_price/{id}
async function tokenPrice(params: {
  id: string;
  contract_addresses: string[];
  vs_currencies: string[];
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
  precision?: string;
}) {
  try {
    const url = `/simple/token_price/${params.id}`;
    const queryParams = {
      contract_addresses: params.contract_addresses.toString(),
      vs_currencies: params.vs_currencies.toString(),
      include_market_cap: params.include_market_cap ?? 'false',
      include_24hr_vol: params.include_24hr_vol ?? 'false',
      include_24hr_change: params.include_24hr_change ?? 'false',
      include_last_updated_at: params.include_last_updated_at ?? 'false',
      precision: params.precision ?? 'full',
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
    if (isAxiosError(error) && error.response) {
      throw new ExpressError(
        'CGE00003',
        error.response.data.error,
        error.response.status
      );
    }
    throw new ExpressError(
      'CGE00004',
      error.message ?? 'Something Went Wrong',
      400
    );
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
  ids?: string[];
  category?: string;
  per_page?: string;
  page?: string;
  precision?: string;
}) {
  try {
    const url = `/coins/markets`;
    const queryParams: Record<string, string> = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: params.per_page ?? '100',
      page: params.page ?? '1',
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d,14d,30d',
      locale: 'en',
      precision: params.precision ?? 'full',
    };

    if (params.ids && params.ids.length > 0) {
      queryParams['ids'] = params.ids.toString();
    }

    if (params.category) {
      queryParams['category'] = params.category;
    }

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

const cgRequests = {
  tokenPrice,
  tokenInfoFromAddress,
  marketChartFromAddress,
  coinMarketData,
};

export default cgRequests;
