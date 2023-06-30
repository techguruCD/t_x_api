import { isAxiosError } from 'axios';
import { ExpressError } from '../utils/error.utils';
import geckoAxios from './geckoAxios';

// /networks/{network}/pools/{address}
async function getPool(params: { network: 'bsc' | 'eth'; address: string }) {
  try {
    const url = `/networks/${params.network}/pools/${params.address}`;
    const queryParams = {
      include: 'base_token,quote_token',
    };

    const geckoResponse = await geckoAxios.get(url, {
      params: queryParams,
    });

    const data = geckoResponse.data.data;
    const included = geckoResponse.data.included;
    if (!data) {
      return null;
    }

    return {
      address: data.attributes.address,
      name: `${included[0].attributes.symbol}/${included[1].attributes.symbol}`,
      price: data.attributes.base_token_price_native_currency,
      base: included[0].attributes,
      quote: included[1].attributes,
    };
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      const errors = error.response.data.errors;
      throw new ExpressError(
        'GT00001',
        errors[0]?.title,
        error.response.status
      );
    }
    throw new ExpressError(
      'GT00002',
      error.message ?? 'Something Went Wrong',
      400
    );
  }
}

const geckoRequests = {
  getPool,
};

export default geckoRequests;
