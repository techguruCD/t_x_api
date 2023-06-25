import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';
import { ExpressError } from '../utils/error.utils';

async function getCoinInfo(params: { address: string }) {
  const projection: Record<string, number> = {
    _id: 1,
    address: 1,
    assetPlatform: 1,
    decimal: 1,
    name: 1,
    network: 1,
    symbol: 1,
  };

  const coin = await coinsModel
    .findOne({ address: params.address }, projection)
    .lean();

  if (!coin) {
    throw new ExpressError('CSE00001', 'coin not found', 404);
  }

  const responseData = { ...coin };

  if (!responseData.cgTokenPrice) {
    const cgTokenPrice = await cgRequests.tokenPrice({
      id: coin.assetPlatform,
      contract_addresses: [coin.address],
      vs_currencies: ['usd'],
      include_24hr_change: true,
      include_24hr_vol: true,
      include_last_updated_at: true,
      include_market_cap: true,
    });
    responseData.cgTokenPrice = cgTokenPrice;
  }

  if (!responseData.cgTokenInfo) {
    const cgTokenInfo = await cgRequests.tokenInfoFromAddress({
      id: coin.assetPlatform,
      contract_address: coin.address,
    });
    responseData.cgTokenInfo = cgTokenInfo;
  }

  if (!responseData.cgMarketChart) {
    const cgMarketChart = await cgRequests.marketChartFromAddress({
      id: coin.assetPlatform,
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
      projection: {
        adress: 1,
        name: 1,
        image: '$cgTokenInfo.image.small',
        price: '$cgTokenInfo.market_data.current_price.usd',
        priceChangeInPercentage:
          '$cgTokenInfo.market_data.price_change_percentage_1h_in_currency.usd',
        chartData: '$cgMarketChart.prices',
        updatedAt: 1,
      },
    }
  );

  return updatedCoin;
}

const coinService = {
  getCoinInfo,
};

export default coinService;
