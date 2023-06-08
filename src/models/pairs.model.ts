import mongoose, { model } from 'mongoose';

const pairsSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
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
  quotePrice: {
    type: String,
    required: true,
  },
});

const pairsModel = model('Pairs', pairsSchema, 'Pairs');

export default pairsModel;
