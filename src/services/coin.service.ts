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
    updatedAt: 1,
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


  if (!responseData.cgMarketData) {
    const cgTokenInfo = await cgRequests.tokenInfoFromAddress({
      contract_address: params.address,
      id: coin.assetPlatform
    });

    if (!cgTokenInfo) {
      const priceFromBitquery = await bitqueryRequests.searchTokenPriceInUSD({
        address: params.address,
        network: coin.network as any,
      });
      await coinsModel.findOneAndUpdate(
        { address: params.address },
        { $set: { "cgMarketData.current_price": priceFromBitquery } });
    } else {
      await coinsModel.findOneAndUpdate(
        { address: params.address },
        {
          $set: {
            "cgMarketData.id": cgTokenInfo.id,
            "cgMarketData.symbol": cgTokenInfo.symbol,
            "cgMarketData.name": cgTokenInfo.name,
            "cgMarketData.image": cgTokenInfo.image.large,
            "cgMarketData.current_price": cgTokenInfo.market_data.current_price.usd,
            "cgMarketData.market_cap": cgTokenInfo.market_data.market_cap.usd,
            "cgMarketData.market_cap_rank": cgTokenInfo.market_data.market_cap_rank,
            "cgMarketData.fully_diluted_valuation": cgTokenInfo.market_data.fully_diluted_valuation.usd,
            "cgMarketData.total_volume": cgTokenInfo.market_data.total_volume.usd,
            "cgMarketData.high_24h": cgTokenInfo.market_data.high_24h.usd,
            "cgMarketData.low_24h": cgTokenInfo.market_data.low_24h.usd,
            "cgMarketData.price_change_24h": cgTokenInfo.market_data.price_change_24h,
            "cgMarketData.price_change_percentage_24h": cgTokenInfo.market_data.price_change_percentage_24h,
            "cgMarketData.market_cap_change_24h": cgTokenInfo.market_data.market_cap_change_24h,
            "cgMarketData.market_cap_change_percentage_24h": cgTokenInfo.market_data.market_cap_change_percentage_24h,
            "cgMarketData.circulating_supply": cgTokenInfo.market_data.circulating_supply,
            "cgMarketData.total_supply": cgTokenInfo.market_data.total_supply,
            "cgMarketData.max_supply": cgTokenInfo.market_data.max_supply,
            "cgMarketData.ath": cgTokenInfo.market_data.ath.usd,
            "cgMarketData.ath_change_percentage": cgTokenInfo.market_data.ath_change_percentage.usd,
            "cgMarketData.ath_date": cgTokenInfo.market_data.ath_date.usd,
            "cgMarketData.atl": cgTokenInfo.market_data.atl.usd,
            "cgMarketData.atl_change_percentage": cgTokenInfo.market_data.atl_change_percentage.usd,
            "cgMarketData.atl_date": cgTokenInfo.market_data.atl_date.usd,
            "cgMarketData.roi": cgTokenInfo.market_data.roi,
            "cgMarketData.last_updated": cgTokenInfo.market_data.last_updated,
          }
        }
      );
    }
  }

  const response = {
    _id: coin._id,
    address: coin.address,
    assetPlatform: coin.assetPlatform,
    decimals: coin.decimals,
    name: coin.name,
    network: coin.network,
    symbol: coin.symbol,
    isFav: Boolean(isFav),

  }

  return response;
}

const coinService = {
  getCoinInfo,
};

export default coinService;
