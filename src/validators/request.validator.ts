import {
  enums,
  object,
  string,
  refine,
  is,
  any,
  optional,
  number,
  boolean,
  array,
} from 'superstruct';

const methods = enums([
  'searchCoin',
  'searchPairs',
  'setFavCoin',
  'getFavCoin',
  'removeFavCoin',
  'setPairPriceAlert',
  'tokenCreate',
  'tokenRefresh',
]);

const SearchCoinParams = object({
  network: enums(['ethereum', 'bsc']),
  string: string(),
  limit: optional(number()),
  offset: optional(number()),
  fromBitquery: boolean(),
});

const SearchPairParams = object({
  network: enums(['ethereum', 'bsc']),
  currency: string(),
  limit: optional(number()),
  offset: optional(number()),
  fromBitquery: boolean(),
});

const SetFavCoinParams = object({
  address: string(),
});

const GetFavCoinParams = object({
  address: optional(string()),
  tokenPrice: optional(boolean()),
  tokenInfo: optional(boolean()),
  marketChart: optional(boolean()),
  marketData: optional(boolean()),
});

const RemoveFavCoinParams = object({
  addresses: array(string()),
});

const SetPriceAlertParams = object({
  network: enums(['eth', 'bsc']),
  buyCurrency: string(),
  sellCurrency: string(),
});

const TokenCreateParams = object({
  userId: string(),
  deviceId: string(),
});

const TokenRefreshParams = object({
  refreshToken: string(),
});

const RequestValidator = refine(
  object({
    method: methods,
    args: any(),
  }),
  'RequestValidator',
  (value) => {
    const msg = 'Invalid parameters';

    const { method, args } = value;

    if (method === 'searchCoin' && !is(args, SearchCoinParams)) {
      return msg;
    }

    if (method === 'searchPairs' && !is(args, SearchPairParams)) {
      return msg;
    }

    if (method === 'setFavCoin' && !is(args, SetFavCoinParams)) {
      return msg;
    }

    if (method === 'getFavCoin' && !is(args, GetFavCoinParams)) {
      return msg;
    }

    if (method === 'removeFavCoin' && !is(args, RemoveFavCoinParams)) {
      return msg;
    }

    if (method === 'setPairPriceAlert' && !is(args, SetPriceAlertParams)) {
      return msg;
    }

    if (method === 'tokenCreate' && !is(args, TokenCreateParams)) {
      return msg;
    }

    if (method === 'tokenRefresh' && !is(args, TokenRefreshParams)) {
      return msg;
    }

    return true;
  }
);

export default RequestValidator;
