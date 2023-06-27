import mongoose from 'mongoose';

const favCoinSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const favCoinsModel = mongoose.model('FavCoins', favCoinSchema, 'FavCoins');

export default favCoinsModel;
