import mongoose from 'mongoose';

const favCoinSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'Users',
  },
  address: {
    type: String,
    required: true,
    ref: 'Coins',
  },
  assetPlatform: {
    type: String,
    required: true,
  },
  cgTokenPrice: {
    type: mongoose.Schema.Types.Mixed,
  },
  cgTokenInfo: {
    type: mongoose.Schema.Types.Mixed,
  },
  cgMarketChart: {
    type: mongoose.Schema.Types.Mixed,
  },
  cgMarketData: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const favCoinsModel = mongoose.model('FavCoins', favCoinSchema, 'FavCoins');

export default favCoinsModel;
