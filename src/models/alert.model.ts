import { Schema, model } from 'mongoose';

const alertSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'Users',
  },
  baseCurrency: {
    type: String,
    required: true,
    ref: 'Coins',
  },
  quoteCurrency: {
    type: String,
    required: true,
    ref: 'Coins',
  },
  price: {
    type: Number,
    default: null,
  },
  side: {
    type: String,
    enum: ['up', 'down'],
  },
});

const alertModel = model('Alerts', alertSchema, 'Alerts');

export default alertModel;
