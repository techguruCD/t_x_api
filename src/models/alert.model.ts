import { Document, Schema, model } from 'mongoose';

interface BaseAlertDocument extends Document {
  alertPlatform: 'cg' | 'dex';
  userId: string;
  alertPrice: number;
  alertPercentage: number;
  alertSide: 'up' | 'down';
  alertExecutionStatus: 'pending' | 'executed';
  createdAt: Date;
  updatedAt: Date;
}

const baseAlertSchema = new Schema<BaseAlertDocument>(
  {
    alertPlatform: {
      type: String,
      enum: ['cg', 'dex'],
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    alertPrice: {
      type: Number,
      required: true
    },
    alertPercentage: {
      type: Number,
      required: true
    },
    alertSide: {
      type: String,
      enum: ['up', 'down'],
      required: true
    },
    alertExecutionStatus: {
      type: String,
      enum: ['pending', 'executed'],
      default: 'pending'
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    discriminatorKey: 'alertPlatform',
  }
);

const baseAlertModel = model<BaseAlertDocument>('Alerts', baseAlertSchema, 'Alerts');

interface CgAlertDocument extends BaseAlertDocument {
  coinId: string;
  cwCoinId: string;
}

const cgAlertSchema = baseAlertModel.discriminator<CgAlertDocument>('cg', new Schema<CgAlertDocument>({
  coinId: { type: String, required: true },
  cwCoinId: { type: String, required: true },
}));

interface DexAlertDocument extends BaseAlertDocument {
  baseCurrency: string;
  quoteCurrency?: string;
}

const dexAlertSchema = baseAlertModel.discriminator<DexAlertDocument>('dex', new Schema<DexAlertDocument>({
  baseCurrency: {
    type: String,
    required: true
  },
  quoteCurrency: String
}))

const alertModel = {
  cgAlertSchema,
  dexAlertSchema
}

export default alertModel;