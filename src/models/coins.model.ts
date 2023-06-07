import mongoose, { model } from 'mongoose';

const coinsSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    index: true,
  },
  decimals: {
    type: Number,
    required: true,
  },
  tokenType: {
    type: String,
    required: true,
  },
});

const coinsModel = model('Coins', coinsSchema, 'Coins');

export default coinsModel;
