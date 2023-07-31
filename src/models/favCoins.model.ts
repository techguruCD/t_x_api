import mongoose, { Schema } from 'mongoose';

const favCoinSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: 'Users',
    },
    // TODO: cleanup
    address: {
      type: String,
      ref: 'Coins',
    },
    platform: String,
    value: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const favCoinsModel = mongoose.model('FavCoins', favCoinSchema, 'FavCoins');

export default favCoinsModel;
