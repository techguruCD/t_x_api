import moment from 'moment';
import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';
import favCoinsModel from '../models/favCoins.model';
import { ExpressError } from '../utils/error.utils';
import bitqueryRequests from '../bitquery/requests';

async function getCoinInfo(params: { userId: string; address: string }) {
  const projection: Record<string, number | string> = {
    address: 1,
    name: 1,
    assetPlatform: 1,
    network: 1,
    symbol: 1,
    decimals: 1,
    image: '$cgTokenInfo.image.small',
    price: '$cgTokenInfo.market_data.current_price.usd',
    priceChangeInPercentage:
      '$cgTokenInfo.market_data.price_change_percentage_1h_in_currency.usd',
    chartData: '$cgMarketChart.prices',
    updatedAt: 1,
  };

  const [coin, isFav] = await Promise.all([
    coinsModel
      .findOne(
        { address: params.address.toLowerCase() },
        {
          ...projection,
          cgTokenPrice: 1,
          cgTokenInfo: 1,
          cgMarketChart: 1,
          cgMarketData: 1,
        }
      )
      .lean(),
    favCoinsModel
      .exists({ userId: params.userId, address: params.address })
      .lean(),
  ]);

  if (!coin) {
    throw new ExpressError('CSE00001', 'coin info not found', 404);
  }

  const responseData = { ...coin };

  if (!responseData.cgTokenPrice) {
    const cgTokenPrice = await cgRequests.tokenPrice({
      id: coin.network === 'ethereum' ? 'ethereum' : 'binance-smart-chain',
      contract_addresses: [coin.address],
      vs_currencies: ['usd'],
      include_24hr_change: true,
      include_24hr_vol: true,
      include_last_updated_at: true,
      include_market_cap: true,
    });
    responseData.cgTokenPrice = cgTokenPrice[coin.address];
  }

  if (!responseData.cgTokenInfo) {
    try {
      const cgTokenInfo = await cgRequests.tokenInfoFromAddress({
        id: coin.network === 'ethereum' ? 'ethereum' : 'binance-smart-chain',
        contract_address: coin.address,
      });
      responseData.cgTokenInfo = cgTokenInfo;
    } catch (error) {
      if (error instanceof ExpressError && error.code === 'CGE00003') {
        const priceFromBitquery = await bitqueryRequests.searchTokenPriceInUSD({
          address: params.address,
          network: coin.network as any,
        });
        if (responseData.cgTokenPrice) {
          delete responseData.cgTokenPrice;
        }
        return {
          ...responseData,
          isFav: Boolean(isFav),
          price: priceFromBitquery,
        };
      }
    }
  }

  if (!responseData.cgMarketChart) {
    const cgMarketChart = await cgRequests.marketChartFromAddress({
      id: coin.network === 'ethereum' ? 'ethereum' : 'binance-smart-chain',
      contract_address: coin.address,
      days: '30',
      vs_currency: 'usd',
    });
    responseData.cgMarketChart = cgMarketChart;
  }

  if (!responseData.cgMarketData) {
    const cgMarketData = await cgRequests.coinMarketData({
      ids: [responseData.cgTokenInfo.id || coin.cgTokenInfo.id],
    });
    responseData.cgMarketData = cgMarketData;
  }

  const updatedCoin = await coinsModel.findOneAndUpdate(
    { address: coin.address },
    { $set: responseData },
    {
      new: true,
      projection,
    }
  );

  if (!updatedCoin) {
    throw new ExpressError('CSE00002', 'coin not found', 404);
  }

  const response: Record<string, any> = {
    ...updatedCoin.toObject(),
  };

  response['isFav'] = Boolean(isFav);

  if (response['chartData']) {
    response['chartData'] = response['chartData'].map((data: number[]) => ({
      key: moment.utc(data[0]).format('DD-MM-YYYY h:mm A'),
      value: data[1],
    }));
  }

  return response;
}

const coinService = {
  getCoinInfo,
};

export default coinService;
