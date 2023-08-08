import { Schema, model } from 'mongoose';

const cgListSchema = new Schema({
    id: {
        type: String,
        unique: true
    },
    symbol: String,
    name: String,
    image: String,
    current_price: Number,
    market_cap: Number,
    market_cap_rank: Number,
    fully_diluted_valuation: Number,
    total_volume: Number,
    high_24h: Number,
    low_24h: Number,
    price_change_24h: Number,
    price_change_percentage_24h: Number,
    market_cap_change_24h: Number,
    market_cap_change_percentage_24h: Number,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    ath: Number,
    ath_change_percentage: Number,
    ath_date: String,
    atl: Number,
    atl_change_percentage: Number,
    atl_date: String,
    roi: new Schema({
        currency: String,
        percentrage: Number
    }),
    last_updated: String,
    price_change_percentage_1h_in_currency: Number
});

const coinInfoSchema = new Schema({
    id: {
        type: String,
        ref: 'CGList'
    },
    symbol: String,
    name: String,
    asset_platform_id: String,
    platforms: Schema.Types.Mixed,
    detail_platforms: Schema.Types.Mixed,
    categories: [String],
    public_notice: String,
    description: Schema.Types.Mixed,
    links: Schema.Types.Mixed,
    image: new Schema({
        thumb: String,
        small: String,
        large: String
    }),
    market_cap_rank: Number,
    coingecko_rank: Number,
    coingecko_score: Number,
    developer_score: Number,
    community_score: Number,
    liquidity_score: Number,
    public_interest_score: Number,
    last_updated: String
});

const tickersSchema = new Schema({
    id: {
        type: String,
        ref: 'CGList'
    },
    name: String,
    tickers: [Schema.Types.Mixed]
});

const CGListModel = model('CGList', cgListSchema, 'CGList');
const CGCoinInfoModel = model('CGInfo', coinInfoSchema, 'CGInfo');
const CGTickersModel = model('CGTickers', tickersSchema, 'CGTickers');

const cgModel = {
    CGListModel,
    CGCoinInfoModel,
    CGTickersModel
};

export default cgModel;
