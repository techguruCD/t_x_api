import mongoose from 'mongoose';
import alertModel from '../models/alert.model';
import coinsModel from '../models/coins.model';
import { ExpressError } from '../utils/error.utils';
import favCoinsModel from '../models/favCoins.model';

async function setAlert(params: {
  userId: string;
  alertBaseCurrency: string;
  alertSide: 'up' | 'down';
  alertPrice?: number;
  alertPercentage?: number;
}) {
  const newAlertData: Record<string, any> = {
    userId: params.userId,
    alertBaseCurrency: params.alertBaseCurrency,
    alertSide: params.alertSide,
  };

  if (params.alertPrice) {
    if (params.alertPrice < 0) {
      throw new ExpressError('AS00001', 'Alert cannot be negative', 400);
    }
    newAlertData['alertPrice'] = params.alertPrice;
  }

  if (params.alertPercentage) {
    if (params.alertPercentage > 100 || params.alertPercentage < 0) {
      throw new ExpressError(
        'AS00002',
        'Percentage should be between 0 & 100',
        400
      );
    }

    const coin = await coinsModel
      .findOne({ address: params.alertBaseCurrency })
      .lean();
    if (coin) {
      newAlertData['alertPercentage'] = params.alertPercentage;
      const priceInDb = coin.cgTokenInfo.market_data.current_price.usd;
      if (params.alertSide === 'up') {
        newAlertData['alertPrice'] =
          priceInDb + priceInDb * (params.alertPercentage / 100);
      } else {
        newAlertData['alertPrice'] =
          priceInDb - priceInDb * (params.alertPercentage / 100);
      }
    }
  }

  const newAlert = await new alertModel(newAlertData).save();
  return newAlert.toObject();
}

async function deleteAlert(params: { userId: string; alertId: string }) {
  const removedAlert = await alertModel
    .findOneAndRemove({ userId: params.userId, _id: params.alertId })
    .lean();

  return removedAlert;
}

async function getAlerts(params: { userId: string }) {
  const alerts = await alertModel.aggregate([
    {
      $match: {
        userId: params.userId,
      },
    },
    {
      $lookup: {
        from: 'Coins',
        localField: 'alertBaseCurrency',
        foreignField: 'address',
        as: 'info',
      },
    },
    {
      $unwind: {
        path: '$info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        userId: 1,
        alertBaseCurrency: 1,
        alertPrice: 1,
        alertPercentage: 1,
        alertSide: 1,
        alertExecutionStatus: 1,
        name: '$info.name',
        image: '$info.cgTokenInfo.image.small',
        currentPrice: '$info.cgTokenInfo.market_data.current_price.usd',
      },
    },
  ]);
  return alerts;
}

async function getAlert(params: { userId: string; alertId: string }) {
  const alert = await alertModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(params.alertId),
        userId: params.userId,
      },
    },
    {
      $lookup: {
        from: 'Coins',
        localField: 'alertBaseCurrency',
        foreignField: 'address',
        as: 'info',
      },
    },
    {
      $unwind: {
        path: '$info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        userId: 1,
        alertBaseCurrency: 1,
        alertPrice: 1,
        alertPercentage: 1,
        alertSide: 1,
        alertExecutionStatus: 1,
        name: '$info.name',
        image: '$info.cgTokenInfo.image.small',
        currentPrice: '$info.cgTokenInfo.market_data.current_price.usd',
      },
    },
  ]);

  if (alert.length === 1) {
    const isFav = await favCoinsModel.exists({
      userId: params.userId,
      address: alert[0].alertBaseCurrency,
    });

    if (isFav) {
      alert[0].isFav = true;
    } else {
      alert[0].isFav = false;
    }
  }
  return alert;
}

const alertService = {
  setAlert,
  deleteAlert,
  getAlerts,
  getAlert,
};

export default alertService;
