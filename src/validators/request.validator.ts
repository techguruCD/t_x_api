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
  'getAlert',
  'coinInfo',
  'logout',
  'listTop100',
  'coinInfoV2',
]);

const ValidTwitterUsername = pattern(string(), /^[A-Za-z0-9_]{1,15}$/);
const ValidDiscordUsername = pattern(string(), /^[A-Za-z0-9_.]{2,32}$/);
export const ValidWalletAddress = pattern(string(), /^(0x)?[0-9a-fA-F]{40}$/);
export const ValidRefCode = pattern(string(), /^[a-zA-Z0-9]{16}$/);

const SearchCoinParams = object({
  network: enums(['ethereum', 'bsc']),
  string: string(),
  limit: optional(number()),
  offset: optional(number()),
});

const SearchPairParams = object({
  network: enums(['ethereum', 'bsc']),
  currency: string(),
  limit: optional(number()),
  offset: optional(number()),
  fromBitquery: boolean(),
});

const SetFavCoinParams = object({
  platform: string(),
  value: any(),
});

const GetFavCoinParams = object({
  skip: optional(number()),
  limit: optional(number())
})

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
  oldDeviceId: optional(string()),
  emailId: optional(string()),
  username: optional(string()),
  photoUrl: optional(string()),
});

const TokenRefreshParams = object({
  refreshToken: string(),
});

const UpdateUserParams = object({
  twitterUsername: optional(ValidTwitterUsername),
  discordUsername: optional(ValidDiscordUsername),
  walletAddress: optional(ValidWalletAddress),
  referrer: optional(ValidRefCode),
});

const SetAlertParams = object({
  alertBaseCurrency: ValidWalletAddress,
  alertSide: enums(['up', 'down']),
  alertPrice: optional(number()),
  alertPercentage: optional(number()),
});

const DeleteAlertParams = object({
  alertId: string(),
});

const GetAlertParams = object({
  alertId: string(),
});

const CoinInfoParams = object({
  address: string(),
});

const CoinInfoV2Params = object({
  platform: string(),
  id: number()
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

    if (method === 'getAlert' && !is(args, GetAlertParams)) {
      return msg;
    }

    if (method === 'coinInfo' && !is(args, CoinInfoParams)) {
      return msg;
    }

    if (method === 'coinInfoV2' && !is(args, CoinInfoV2Params)) {
      return msg;
    }

    return true;
  }
);

export default RequestValidator;
