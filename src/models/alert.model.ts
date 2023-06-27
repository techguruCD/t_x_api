import { Schema, model } from 'mongoose';

const alertSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: 'Users',
    },
    alertBaseCurrency: {
      type: String,
      required: true,
      ref: 'Coins',
    },
    alertPrice: {
      type: Number,
      default: null,
    },
    alertPercentage: {
      type: Number,
      default: null,
    },
    alertSide: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
    alertExecutionStatus: {
      type: String,
      enums: ['pending', 'executed'],
      default: 'pending',
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const alertModel = model('Alerts', alertSchema, 'Alerts');

export default alertModel;
