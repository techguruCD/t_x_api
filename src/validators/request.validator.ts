import {
  enums,
  object,
  string,
  refine,
  is,
  any,
  optional,
  number,
  array,
  pattern,
  union,
} from 'superstruct';

const methods = enums([
  'search',
  'getPairs',
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
  'listTopTrending10',
  'coinInfoV2',
  'getNetworks',
  'getScanData'
]);

const ValidTwitterUsername = pattern(string(), /^[A-Za-z0-9_]{1,15}$/);
const ValidDiscordUsername = pattern(string(), /^[A-Za-z0-9_.]{2,32}$/);
export const ValidWalletAddress = pattern(string(), /^(0x)?[0-9a-fA-F]{40}$/);
export const ValidRefCode = pattern(string(), /^[a-zA-Z0-9]{16}$/);

const SearchParams = object({
  searchTerm: string(),
  skip: optional(number()),
  limit: optional(number()),
  network: optional(string())
})

const GetPairsParams = object({
  coinId: string(),
  page: optional(number()),
  perPage: optional(number())
})

const SetFavCoinParams = object({
  platform: enums(['cg', 'DEX']),
  value: any(),
  type: enums(['token', 'pair'])
});

const GetFavCoinParams = object({
  skip: optional(number()),
  limit: optional(number())
})

const RemoveFavCoinParams = object({
  _ids: array(string()),
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
  platform: string(),
  value: union([number(), string()]),
  type: string(),
  tokenPairSkip: optional(number())
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

    if (method === 'search' && !is(args, SearchParams)) {
      return msg;
    }

    if (method === 'getPairs' && !is(args, GetPairsParams)) {
      return msg
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

    return true;
  }
);

export default RequestValidator;
