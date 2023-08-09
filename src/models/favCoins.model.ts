import mongoose from 'mongoose';

const favCoinSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: 'Users',
    },
    platform: String,
    value: String,
    type: String,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const favCoinsModel = mongoose.model('FavCoins', favCoinSchema, 'FavCoins');

export default favCoinsModel;
