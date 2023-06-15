import { isAxiosError } from 'axios';
import cgAxios from './cgAxios';
import { ExpressError } from '../utils/error.utils';

type TStringBoolean = 'true' | 'false';

async function tokenPrice(params: {
  id: string;
  contract_addresses: string[];
  vs_currencies: string[];
  include_market_cap?: TStringBoolean;
  include_24hr_vol?: TStringBoolean;
  include_24hr_change?: TStringBoolean;
  include_last_updated_at?: TStringBoolean;
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

const cgRequests = {
  tokenPrice,
};

export default cgRequests;
