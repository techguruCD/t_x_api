import cgRequests from '../coingecko/requests';
import coinsModel from '../models/coins.model';
import { ExpressError } from '../utils/error.utils';

async function getCoinInfo(params: {
  address: string;
  projection: {
    cgTokenPrice: boolean;
    cgTokenInfo: boolean;
    cgMarketChart: boolean;
    cgMarketData: boolean;
  };
}) {
  const projection: Record<string, number> = {
    _id: 1,
    address: 1,
    assetPlatform: 1,
    decimal: 1,
    name: 1,
    network: 1,
    symbol: 1,
  };

  if (params.projection.cgTokenPrice) {
    projection['cgTokenPrice'] = 1;
  }

  if (params.projection.cgTokenInfo) {
    projection['cgTokenInfo'] = 1;
  }

  if (params.projection.cgMarketChart) {
    projection['cgMarketChart'] = 1;
  }

  if (params.projection.cgMarketData) {
    projection['cgMarketData'] = 1;
  }

  const coin = await coinsModel
    .findOne({ address: params.address }, projection)
    .lean();

  if (!coin) {
    throw new ExpressError('CSE00001', 'coin not found', 404);
  }

  const responseData = { ...coin };

  if (params.projection.cgTokenPrice) {
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

  if (params.projection.cgTokenInfo) {
    const cgTokenInfo = await cgRequests.tokenInfoFromAddress({
      id: coin.assetPlatform,
      contract_address: coin.address,
    });
    responseData.cgTokenInfo = cgTokenInfo;
  }

  if (params.projection.cgMarketChart) {
    const cgMarketChart = await cgRequests.marketChartFromAddress({
      id: coin.assetPlatform,
      contract_address: coin.address,
      days: '30',
      vs_currency: 'usd',
    });
    responseData.cgMarketChart = cgMarketChart;
  }

  if (params.projection.cgMarketData) {
    const cgMarketData = await cgRequests.coinMarketData({
      ids: [responseData.cgTokenInfo.id || coin.cgTokenInfo.id],
    });
    responseData.cgMarketData = cgMarketData;
  }

  const updatedCoin = await coinsModel.findOneAndUpdate(
    { address: coin.address },
    { $set: responseData },
    { new: true, projection }
  );

  return updatedCoin;
}

const coinService = {
  getCoinInfo,
};

export default coinService;
