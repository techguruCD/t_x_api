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

| Name          | Type   | Description                                                                                                                                                                                                                                                    | Required |
| ------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `userId`      | string | `userId` should be email id if provided by the specific social login provider                                                                                                                                                                                  | Yes      |
| `deviceId`    | string | `deviceId` should be provided by the FCM which is specific per device                                                                                                                                                                                          | Yes      |
| `emailId`     | string | `emailId` should be provided by the respective social login provider.                                                                                                                                                                                          | No       |
| `username`    | string | `username` should be provided by the respective social login provider.                                                                                                                                                                                         | Yes      |
| `photoUrl`    | string | `photoUrl` should be provided by the respective social login provider.                                                                                                                                                                                         | No       |
| `oldDeviceId` | string | `oldDeviceId` should be the previous device id which must be stored on user's device to refresh the device registration token on the backend side. **Not required for the new users but required when generating a new access and refresh token for the user** | No       |

Example Body:

```json
{
  "method": "tokenCreate",
  "args": {
    "userId": "testUser",
    "deviceId": "testDevice",
    "emailId": "elon@musk.com",
    "username": "elonmusk",
    "photoUrl": "https://twitter.com/doge.png",
    "oldDeviceId": "testDeviceToken"
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

## Private Methods

**NOTE: Private methods required auth. So, api call requires `authorization` header and the value of it should be the access token retrieved from `tokenCreate` or `tokenRefresh` methods.**

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

| Name              | Type   | Description                                  | Required |
| ----------------- | ------ | -------------------------------------------- | -------- |
| `twitterUsername` | string | `twitterUsername` of a user (without `@`)    | No       |
| `discordUsername` | string | `discordusername` of a user                  | No       |
| `walletAddress`   | string | `walletAddress` of a user                    | No       |
| `referrer`        | string | `refCode` of a user who has invited the user | No       |

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

### Method: `logout`

Description: Logout user by clearing their device token from the db

Args: none

Example Body:

```json
{
  "method": "updateUser"
}
```

---

### Method: `listTop100`

Description: List top 100 coins by market cap. Usage for homescreen

Args: none

Example Body:

```json
{
    "method": "listTop100"
}
```

---

### Method: `coinInfo`

Description: Fetch information for a specific coin. Use projection to get required data.

Args:

| Name       | Type   | Description                                                                                                                       | Required |
| ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `platform` | string | `platform` of a specific token                                                                                                    | Yes      |
| `value`    | string | `value` to fetch info for specific coin for specific token. **`value` is the `id` from the list of top 100 coins or search list** | Yes      |

Example Body:

```json
{
  "method": "coinInfo",
  "args": {
    "platform": "cmc",
    "value": 5
  }
}
```

---

### Method: `setFavCoin`

Description: Set a favorite coin for a specific user by providing the address of the coin

Args:

| Name       | Type   | Description                                                                                                                       | Required |
| ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `platform` | string | `platform` of a specific token                                                                                                    | Yes      |
| `value`    | string | `value` to fetch info for specific coin for specific token. **`value` is the `id` from the list of top 100 coins or search list** | Yes      |

Example Body:

```json
{
  "method": "setFavCoin",
  "args": {
    "platform": "cmc",
    "value": 1027
  }
}
```

---

### Method: `searchCoin`

Description: Search tokens by address, name or symbol

Args:

| Name      | Type   | Description                                              | Required |
| --------- | ------ | -------------------------------------------------------- | -------- |
| `network` | string | `network` should be either `ethereum` or `bsc`           | Yes      |
| `string`  | string | `string` can be either coin name, symbol or address      | Yes      |
| `limit`   | number | pagination parameter to fetch specific length of records | No       |
| `offset`  | number | pagination parameter to skip specific number of records  | No       |

Example Body:

```json
{
  "method": "searchCoin",
  "args": {
    "network": "ethereum",
    "string": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "limit": 10,
    "offset": 0
  }
}
```

---

### Method: `getFavCoin`

Description: Get list of favorite coins of a specific user.
Args: 

| Name    | Type   | Description                                              | Required |
| ------- | ------ | -------------------------------------------------------- | -------- |
| `limit` | number | pagination parameter to fetch specific length of records | No       |
| `skip`  | number | pagination parameter to skip specific number of records  | No       |

Example Body:

```json
{
  "method": "getFavCoin",
  "args": {}
}
```

---

### Method: `removeFavCoin`

Description: Remove coins from the favorite list.

Args:

| Name   | Type     | Description                                                                                      | Required |
| ------ | -------- | ------------------------------------------------------------------------------------------------ | -------- |
| `_ids` | string[] | `_ids` is a array of string and it should include _ids of coins to be removed from favorite list | Yes      |

Example Body:

```json
{
  "method": "removeFavCoin",
  "args": {
    "_ids": ["64c7bb95d81a47997551f851"]
  }
}
```

---

### Method: `setAlert`

Description: Used to set alert for a specific coin

Args:

| Name                | Type   | Description                                                                                                                        | Required |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `alertBaseCurrency` | string | `address` of a specific token                                                                                                      | Yes      |
| `alertSide`         | string | Must be either `up` or `down`                                                                                                      | Yes      |
| `alertPrice`        | number | price to fire alert. **It cannot be less than 0** alertPrice is required, if this is not provided                                  | No       |
| `alertPercentage`   | number | x percentage up or down from the current price. **It can not be less han 0%** alertPercentage is required, if this is not provided | No       |

Example Body:

```json
{
  "method": "setAlert",
  "args": {
    "alertBaseCurrency": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "alertSide": "down",
    "alertPercentage": 10, // optional, alertPrice is required, if this is not provided
    "alertPrice": 100 // optional, alertPercentage is required, if this is not provided
  }
}
```

---

### Method: `getAlerts`

Description: Get all the alerts set by the user

Args:

| Name       | Type    | Description                                                                                                           | Required |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| `executed` | boolean | `executed` should be provided as `true` to fetch the alerts which were already executed. **Useful for alert history** | No       |

Example Body:

```json
{
  "method": "getAlerts",
  "args": {}
}
```

### Method: `getAlert`

Description: Get a specific alert set by the user

Args:

| Name      | Type   | Description                                                                                | Required |
| --------- | ------ | ------------------------------------------------------------------------------------------ | -------- |
| `alertId` | string | `alertId` of a specific alert. It is `_id` from the list of alerts in `getAlerts` response | Yes      |

Example Body:

```json
{
  "method": "getAlert",
  "args": {
    "alertId": "64996ac5cb157918450918e0"
  }
}
```

---

### Method: `deleteAlert`

Description: Delete a specific alert set by the user

Args:

| Name      | Type   | Description                                                                                | Required |
| --------- | ------ | ------------------------------------------------------------------------------------------ | -------- |
| `alertId` | string | `alertId` of a specific alert. It is `_id` from the list of alerts in `getAlerts` response | Yes      |

Example Body:

```json
{
  "method": "deleteAlert",
  "args": {
    "alertId": "649016060f9683cb26baa76e"
  }
}
```
