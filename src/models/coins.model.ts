import mongoose, { model } from 'mongoose';

const cgMarketDataSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  symbol: mongoose.Schema.Types.Mixed,
  name: mongoose.Schema.Types.Mixed,
  image: mongoose.Schema.Types.Mixed,
  current_price: mongoose.Schema.Types.Mixed,
  market_cap: mongoose.Schema.Types.Mixed,
  market_cap_rank: mongoose.Schema.Types.Mixed,
  fully_diluted_valuation: mongoose.Schema.Types.Mixed,
  total_volume: mongoose.Schema.Types.Mixed,
  high_24h: mongoose.Schema.Types.Mixed,
  low_24h: mongoose.Schema.Types.Mixed,
  price_change_24h: mongoose.Schema.Types.Mixed,
  price_change_percentage_24h: mongoose.Schema.Types.Mixed,
  market_cap_change_24h: mongoose.Schema.Types.Mixed,
  market_cap_change_percentage_24h: mongoose.Schema.Types.Mixed,
  circulating_supply: mongoose.Schema.Types.Mixed,
  total_supply: mongoose.Schema.Types.Mixed,
  max_supply: mongoose.Schema.Types.Mixed,
  ath: mongoose.Schema.Types.Mixed,
  ath_change_percentage: mongoose.Schema.Types.Mixed,
  ath_date: mongoose.Schema.Types.Mixed,
  atl: mongoose.Schema.Types.Mixed,
  atl_change_percentage: mongoose.Schema.Types.Mixed,
  atl_date: mongoose.Schema.Types.Mixed,
  roi: mongoose.Schema.Types.Mixed,
  last_updated: mongoose.Schema.Types.Mixed
}, { timestamps: { createdAt: true, updatedAt: true } });

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
    cgMarketData: {
      type: cgMarketDataSchema,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const coinsModel = model('Coins', coinsSchema, 'Coins');

export default coinsModel;
