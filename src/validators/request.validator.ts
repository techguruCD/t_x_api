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
  pattern,
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
  'updateUser',
  'getUser',
  'setAlert',
  'deleteAlert',
  'getAlerts',
]);

const ValidTwitterUsername = pattern(string(), /^[A-Za-z0-9_]{1,15}$/);
const ValidDiscordUsername = pattern(string(), /^[A-Za-z0-9_.]{2,32}$/);
const ValidWalletAddress = pattern(string(), /^(0x)?[0-9a-fA-F]{40}$/);

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

const UpdateUserParams = object({
  twitterUsername: optional(ValidTwitterUsername),
  discordUsername: optional(ValidDiscordUsername),
  walletAddress: optional(ValidWalletAddress),
});

const SetAlertParams = object({
  baseCurrency: ValidWalletAddress,
  quoteCurrency: optional(ValidWalletAddress),
  price: number(),
  side: enums(['up', 'down']),
});

const DeleteAlertParams = object({
  alertId: string(),
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

    if (method === 'updateUser' && !is(args, UpdateUserParams)) {
      return msg;
    }

    if (method === 'setAlert' && !is(args, SetAlertParams)) {
      return msg;
    }

    if (method === 'deleteAlert' && !is(args, DeleteAlertParams)) {
      return msg;
    }

    return true;
  }
);

export default RequestValidator;
