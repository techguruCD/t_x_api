import mongoose, { model } from 'mongoose';

const coinsSchema = new mongoose.Schema(
  {
    network: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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
    assetPlatform: {
      type: String,
      required: true,
    },
    cgTokenPrice: {
      type: mongoose.Schema.Types.Mixed,
    },
    cgMarketData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const coinsModel = model('Coins', coinsSchema, 'Coins');

export default coinsModel;
