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

const methods = enums(['searchCoin']);

const SearchCoinParams = object({
  network: enums(['ethereum', 'bsc']),
  string: string(),
  limit: optional(number()),
  offset: optional(number()),
  fromBitquery: boolean(),
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

    return true;
  }
);

export default RequestValidator;
