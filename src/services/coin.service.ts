import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';
import bitqueryRequests from '../bitquery/requests';
import coinListModel from '../models/coinList.model';

async function getCoinInfo(params: { userId: string; address: string }) {
  const projection: Record<string, number | string> = {
    address: 1,
    name: 1,
    assetPlatform: 1,
    network: 1,
    symbol: 1,
    decimals: 1,
    updatedAt: 1,
    cgTokenInfo: 1,
    cgMarketData: 1
  };

  const [coin, isFav] = await Promise.all([
    coinsModel
      .findOne(
        { address: params.address.toLowerCase() },
        projection
      )
      .lean(),
    favCoinsModel
      .exists({ userId: params.userId, address: params.address.toLowerCase() })
      .lean(),
  ]);

  if (!coin) {
    throw new ExpressError('CSE00001', 'coin info not found', 404);
  }

  const responseData = { ...coin };

  if (!responseData.cgTokenPrice) {
    const cgTokenPrice = await cgRequests.tokenPrice({
      id: coin.network === 'ethereum' ? 'ethereum' : 'binance-smart-chain',
      contract_addresses: [coin.address]
    });

    if (!cgTokenPrice) {
      const priceFromBitquery = await bitqueryRequests.searchTokenPriceInUSD({
        address: params.address,
        network: coin.network as any,
      });
      responseData.cgTokenPrice = priceFromBitquery;
    } else {
      responseData.cgTokenPrice = cgTokenPrice[coin.address];
    }
    await coinsModel.findOneAndUpdate({ address: params.address }, { $set: { "cgTokenPrice": responseData.cgTokenPrice } })
  }


  if (!responseData.cgMarketData) {
    const coin = await coinListModel.findOne({ name: responseData.name }, { id: 1 }).lean();

    if (coin) {
      const cgMarketData = await cgRequests.coinMarketData({
        ids: [`${coin.id}`],
      });
      responseData.cgMarketData = cgMarketData[0];
      await coinsModel.findOneAndUpdate({ address: params.address }, { $set: { "cgMarketData": responseData.cgMarketData } })
    }
  }

  if (!responseData.cgTokenPrice || !responseData.cgMarketData) {
    await coinsModel.findOneAndUpdate(
      { address: coin.address },
      { $set: responseData },
      {
        new: true,
        projection,
      }
    );
  }

  const response = {
    isFav: Boolean(isFav)
  }

  return response;
}

const coinService = {
  getCoinInfo,
};

export default coinService;
