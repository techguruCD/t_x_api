import coinsModel from '../models/coins.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';

async function setFavCoin(params: { userId: string; address: string }) {
  const coin = await coinsModel.findOne({ address: params.address }).lean();

  if (!coin) {
    throw new ExpressError('CNF00001', 'Coin Not Found', 404);
  }

  const { address, network } = coin;

  let assetPlatform = 'ethereum';

  if (network === 'bsc') {
    assetPlatform === 'binance-smart-chain';
  }

  const favCoin = await favCoinsModel
    .findOne({
      address,
      assetPlatform: assetPlatform,
      userId: params.userId,
    })
    .lean();

  if (favCoin) {
    return favCoin;
  }

  const newFavCoin = await new favCoinsModel({
    address: params.address,
    assetPlatform,
    userId: params.userId,
  }).save();

  return newFavCoin.toObject();
}

const coinFavService = {
  setFavCoin,
};

export default coinFavService;
