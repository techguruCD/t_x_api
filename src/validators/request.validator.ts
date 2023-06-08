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
} from 'superstruct';

const methods = enums(['searchCoin', 'searchPairs', 'setPairPriceAlert']);

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

const SetPriceAlertParams = object({
  network: enums(['eth', 'bsc']),
  buyCurrency: string(),
  sellCurrency: string(),
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

    if (method === 'setPairPriceAlert' && !is(args, SetPriceAlertParams)) {
      return msg;
    }

    return true;
  }
);

export default RequestValidator;
