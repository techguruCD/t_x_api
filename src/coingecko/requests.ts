import { isAxiosError } from 'axios';
import { ExpressError } from '../utils/error.utils';
import cgAxios from './cgAxios';

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

async function tokenCurrentData(params: {
  id: string;
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}) {
  try {
    const url = `/coins/${params.id}`;
    const queryParams = {
      localization: params.localization ?? true,
      tickers: params.tickers ?? true,
      market_data: params.market_data ?? true,
      community_data: params.community_data ?? true,
      developer_data: params.developer_data ?? true,
      sparkline: params.sparkline ?? false,
    };

    const cgResponse = await cgAxios.get(url, {
      params: queryParams,
    });
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

async function marketChart(params: {
  id: string;
  vs_currency: string;
  days: string;
  interval?: string;
  precision?: string;
}) {
  try {
    const url = `/coins/${params.id}/market_chart`;
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

const cgRequests = {
  tokenPrice,
  tokenCurrentData,
  marketChart,
};

export default cgRequests;
