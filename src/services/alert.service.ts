import alertModel from '../models/alert.model';
import { ExpressError } from '../utils/error.utils';

async function setAlert(params: {
  userId: string;
  baseCurrency: string;
  quoteCurrency?: string;
  price: number;
  side?: 'up' | 'down';
}) {
  const filterObject: Record<string, string | number> = {
    userId: params.userId,
    baseCurrency: params.baseCurrency,
    price: params.price,
  };

  if (params.quoteCurrency) {
    filterObject['quoteCurrency'] = params.quoteCurrency;
  }

  if (params.side) {
    filterObject['side'] = params.side;
  }

  const alert = await alertModel.findOne(filterObject).lean();

  if (alert) {
    throw new ExpressError('SAS00001', 'Alert already set', 400);
  }

  const newAlert = await new alertModel(filterObject).save();
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
