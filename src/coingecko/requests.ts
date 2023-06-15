import { isAxiosError } from 'axios';
import cgAxios from './cgAxios';
import { ExpressError } from '../utils/error.utils';

async function tokenPrice(params: { id: string; contractAddresses: string[] }) {
  try {
    const url = `/simple/token_price/${params.id}`;
    const queryParams = {
      contract_addresses: params.contractAddresses.toString(),
      vs_currencies: 'usd',
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
