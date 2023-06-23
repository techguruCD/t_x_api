# bitquery-api

**Public Method URL**: {{baseUrlRemote}}/public

**Private Method URL**: {{baseUrlRemote}}

**Twitter Callback URL**: {{baseUrlRemote}}/twitter-callback

**Note: `{{baseUrlRemote}}` is defined in postman collection variables**

---

## Public Methods

### Method: `tokenCreate`

Description: Create a new token for a user for specific device.

Args:

| Name       | Type   | Description                                                                   | Required |
| ---------- | ------ | ----------------------------------------------------------------------------- | -------- |
| `userId`   | string | `userId` should be email id if provided by the specific social login provider | Yes      |
| `deviceId` | string | `deviceId` should be provided by the FCM which is specific per device         | Yes      |

Example Body:

```json
{
  "method": "tokenCreate",
  "args": {
    "userId": "testUser",
    "deviceId": "testDevice"
  }
}
```

---

### Method: `tokenRefresh`

Description: Get an access token for specific device by providing access token

Args:

| Name           | Type   | Description                                                                                                                         | Required |
| -------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `refreshToken` | string | `refreshToken` can be obtained from token-create response. It should be stored safely on the client side along with the accessToken | Yes      |

Example Body:

```json
{
  "method": "tokenRefresh",
  "args": {
    "refreshToken": "{{refreshToken}}"
  }
}
```

## Public Methods

**NOTE: Public methods required auth. So, api call requires `authorization` header and the value of it should be the access token retrieved from `tokenCreate` or `tokenRefresh` methods.**

### Method: `getUser`

Description: Get user data

Args: None

Example Body:

```json
{
  "method": "getUser",
  "args": {}
}
```

---

### Method: `updateUser`

Description: Update user data with social and wallet details

Args:

| Name              | Type   | Description                               | Required |
| ----------------- | ------ | ----------------------------------------- | -------- |
| `twitterUsername` | string | `twitterUsername` of a user (without `@`) | No       |
| `discordUsername` | string | `discordusername` of a user               | No       |
| `walletAddress`   | string | `walletAddress` of a user                 | No       |

Example Body:

```json
{
  "method": "updateUser",
  "args": {
    "twitterUsername": "rahultrivedi181",
    "discordUsername": "rahultrivedi180",
    "walletAddress": "0x17265d8Ea26a56C38018B8763994386EF5ae13c3"
  }
}
```

---

### Method: `searchCoin`

Description: Search tokens by address, name or symbol

Args:

| Name           | Type    | Description                                                                                                                                                             | Required |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `network`      | string  | `network` should be either `ethereum` or `bsc`                                                                                                                          | Yes      |
| `string`       | string  | `string` can be either coin name, symbol or address                                                                                                                     | Yes      |
| `limit`        | number  | pagination parameter to fetch specific length of records                                                                                                                | No       |
| `offset`       | number  | pagination parameter to skip specific number of records                                                                                                                 | No       |
| `fromBitquery` | boolean | parameter to indicate whether or not to fetch data from bitquery. it should be used when client doesn't get any records when fromBitquery is not set or if it is false. | No       |

Example Body:

```json
{
  "method": "searchCoin",
  "args": {
    "network": "ethereum",
    "string": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "fromBitquery": true,
    "limit": 10,
    "offset": 0
  }
}
```

---

### Method: `setFavCoin`

Description: Set a favorite coin for a specific user by providing the address of the coin

Args:

| Name      | Type   | Description                   | Required |
| --------- | ------ | ----------------------------- | -------- |
| `address` | string | `address` of a specific token | Yes      |

Example Body:

```json
{
  "method": "setFavCoin",
  "args": {
    "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  }
}
```

---

### Method: `getFavCoin`

Description: Get list of favorite coins of a specific user. Projection can be described in `projection` property as described below. However, projection is not recommended to be used for this method because it can send a huge amount of data. Still, it can be used if the data is necessary

Args:

| Name         | Type   | Description                                                                                                                                                                                                                                                 | Required |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `projection` | object | peroperties under `projection` should be used to describe whether to include specified data in response or not all the properties are `boolean`. Properties under projection are as follows: `cgTokenPrice`, `cgTokenInfo`, `cgMarketChart`, `cgMarketData` | No       |

Example Body:

```json
{
  "method": "getFavCoin",
  "args": {
    "projection": {
      "cgTokenInfo": true,
      "cgMarketChart": true
    }
  }
}
```

---

### Method: `removeFavCoin`

Description: Remove coins from the favorite list.

Args:

| Name        | Type     | Description                                                                                                | Required |
| ----------- | -------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| `addresses` | string[] | `addresses` is a array of string and it should include addresses of coins to be removed from favorite list | Yes      |

---

### Method: `coinInfo`

Description: Fetch information for a specific coin. Use projection to get required data.

Args:

| Name         | Type   | Description                                                                                                                                                                                                                                                 | Required |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `address`    | string | `address` of a specific token                                                                                                                                                                                                                               | Yes      |
| `projection` | object | peroperties under `projection` should be used to describe whether to include specified data in response or not all the properties are `boolean`. Properties under projection are as follows: `cgTokenPrice`, `cgTokenInfo`, `cgMarketChart`, `cgMarketData` | No       |

Example Body:

```json
{
  "method": "coinInfo",
  "args": {
    "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "projection": {
      "cgTokenInfo": true
    }
  }
}
```
