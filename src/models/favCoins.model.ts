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
});

const favCoinsModel = mongoose.model('FavCoins', favCoinSchema, 'FavCoins');

export default favCoinsModel;
