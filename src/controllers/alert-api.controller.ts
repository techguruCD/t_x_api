import axios, { isAxiosError } from "axios";
import env from "../env";
import { NextFunction, Request, Response } from "express";
import { ExpressError } from "../utils/error.utils";
import cgModel from "../models/cg.model";
import bqModel from "../models/bq.model";

interface SetAlertDTO {
  coinName: string;
  coinLogo: string;
  alertPrice: number;
  alertPercentage: number;
  alertSide?: 'up' | 'down';
  alertExecutionStatus: 'pending' | 'executed';
}

interface SetCgAlertDTO extends SetAlertDTO {
  coinId: string;
  cwSid: string;
  cwCurrencyPairID: string;
}

interface SetDexAlertDTO extends SetAlertDTO {
  assetType: string;
  network: string;
  baseCurrency: string;
  quoteCurrency: string;
}

function alertApiAxiosClient() {
  const axiosClient = axios.create({ baseURL: env().alertApiUrl });
  return axiosClient;
}

async function getAllAlertsForUserIdFromAPI(userId: string, skip = 0, limit = 100) {
  const apiUrl = `${env().alertApiUrl}/alerts/user/${userId}`;

  try {
    const apiResponse = await alertApiAxiosClient().get(apiUrl, { params: { skip, limit } });
    return apiResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Something Went Wrong");
    }
    throw new Error("Something Went Wrong");
  }
}

async function createAlertForUserIdOnCoingeckoPlatformFromAPI(userId: string, setCgAlertDTO: SetCgAlertDTO) {
  const apiUrl = `${env().alertApiUrl}/alerts/user/${userId}/platform/cg`;

  try {
    const apiResponse = await alertApiAxiosClient().post(apiUrl, setCgAlertDTO);
    return apiResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Something Went Wrong");
    }
    throw new Error("Something Went Wrong");
  }
}

async function createAlertForUserIdOnDexPlatformFromAPI(userId: string, setDexAlertDTO: SetDexAlertDTO) {
  const apiUrl = `${env().alertApiUrl}/alerts/user/${userId}/platform/dex`;

  try {
    const apiResponse = await alertApiAxiosClient().post(apiUrl, setDexAlertDTO);
    return apiResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Something Went Wrong");
    }
    throw new Error("Something Went Wrong");
  }
}

async function getAlertByAlertIdForUserIdFromAPI(alertId: string, userId: string) {
  const apiUrl = `${env().alertApiUrl}/alerts/${alertId}/user/${userId}`;

  try {
    const apiResponse = await alertApiAxiosClient().get(apiUrl);
    return apiResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Something Went Wrong");
    }
    throw new Error("Something Went Wrong");
  }
}

async function deleteAlertByAlertIdForUserIdFromAPI(alertId: string, userId: string) {
  const apiUrl = `${env().alertApiUrl}/alerts/${alertId}/user/${userId}`;

  try {
    const apiResponse = await alertApiAxiosClient().delete(apiUrl);
    return apiResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Something Went Wrong");
    }
    throw new Error("Something Went Wrong");
  }
}

async function getAllAlertsForUserId(request: Request, response: Response, next: NextFunction) {
  try {
    const { userId, skip, limit } = request.params;

    const data = await getAllAlertsForUserIdFromAPI(userId, parseInt(skip), parseInt(limit));
    return response.status(200).json(data);
  } catch (error) {
    next(error);
    return;
  }
}

async function createAlertForUserIdOnCoingeckoPlatform(request: Request, response: Response, next: NextFunction) {
    try {
      const { userId } = request.user;
      let { coinName, coinLogo, alertPercentage, coinId, alertSide } = request.body as SetCgAlertDTO;

      const coin = await cgModel.CGCoinInfoModel.findOne({ id: coinId }).lean();

      if (!coin) {
        throw new ExpressError('ASCNF01', 'Coin Not Found', 404);
      }

      if (alertPercentage > 100 || alertPercentage < 0) {
        throw new ExpressError(
          'AS00002',
          'Alert percentage should be between 0 & 100',
          400
        );
      }

      const priceInDB = coin.current_price as unknown as number;
      let alertPrice = 0;

      if (alertSide === 'up') {
        alertPrice = priceInDB + priceInDB * (alertPercentage / 100);
      } else {
        alertPrice = priceInDB - priceInDB * (alertPercentage / 100);
      }

      const data = await createAlertForUserIdOnCoingeckoPlatformFromAPI(userId, {
        alertExecutionStatus: "pending",
        alertPercentage,
        alertPrice,
        coinId,
        coinName, coinLogo,
        cwCurrencyPairID: "12332", // TODO: set it from cw database
        cwSid: "bitcoin", // TODO: set it from cw database
        alertSide: alertSide ?? "up"
    })
    return response.status(200).json(data);
  } catch (error) {
    next(error);
    return;
  }
}

async function createAlertForUserIdOnDexPlatform(request: Request, response: Response, next: NextFunction) {
    try {
      const { userId } = request.user;
      const { coinName, coinLogo, alertPercentage, baseCurrency, quoteCurrency, alertSide, assetType } = request.body as SetDexAlertDTO;

      let filterObject: Record<string, any> = { "buyCurrency.address": baseCurrency };

      if (quoteCurrency) {
        filterObject['sellCurrency.address'] = quoteCurrency;
      }

      if (assetType === 'pair') {
        filterObject = { "smartContract.address.address": baseCurrency };
      }

      const coin = await bqModel.BQPairModel.findOne(filterObject).lean();

      if (!coin) {
        throw new ExpressError('ASCNF01', 'Coin Not Found', 404);
      }

      if (alertPercentage > 100 || alertPercentage < 0) {
        throw new ExpressError(
          'AS00002',
          'Alert percentage should be between 0 & 100',
          400
        );
      }

      const priceInDB = coin.sellCurrencyPrice as unknown as number;
      let alertPrice = 0;

      if (alertSide === 'up') {
        alertPrice = priceInDB + priceInDB * (alertPercentage / 100);
      } else {
        alertPrice = priceInDB - priceInDB * (alertPercentage / 100);
      }

      const data = await createAlertForUserIdOnDexPlatformFromAPI(userId, {
        assetType,
        alertExecutionStatus: 'pending',
        alertPercentage,
        alertPrice: parseInt(`${alertPrice}`),
        coinName, coinLogo,
        baseCurrency,
        network: `${coin.network}`,
        quoteCurrency,
        alertSide: alertSide ?? 'up'
    })
    return response.status(200).json(data);
  } catch (error) {
    next(error);
    return;
  }
}

async function getAlertByAlertIdForUserId(request: Request, response: Response, next: NextFunction) {
    try {
    const { userId } = request.user;
    const { alertId } = request.params;

    const data = await getAlertByAlertIdForUserIdFromAPI(alertId, userId);
    return response.status(200).json(data);
  } catch (error) {
    next(error);
    return;
  }
}

async function deleteAlertByAlertIdForUserId(request: Request, response: Response, next: NextFunction) {
  try {
    const { userId } = request.user;
    const { alertId } = request.params;

    const data = await deleteAlertByAlertIdForUserIdFromAPI(alertId, userId);
    return response.status(200).json(data);
  } catch (error) {
    next(error);
    return;
  }
}

const alertApiControllers = {
  getAllAlertsForUserId,
  createAlertForUserIdOnCoingeckoPlatform,
  createAlertForUserIdOnDexPlatform,
  getAlertByAlertIdForUserId,
  deleteAlertByAlertIdForUserId
}

export default alertApiControllers;