import alertModel from '../models/alert.model';
import coinsModel from '../models/coins.model';
import { ExpressError } from '../utils/error.utils';

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
  const alerts = await alertModel.find({ userId: params.userId }).lean();
  return alerts;
}

const alertService = {
  setAlert,
  deleteAlert,
  getAlerts,
};

export default alertService;
