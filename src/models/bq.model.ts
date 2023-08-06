import { Schema, model } from "mongoose";

const bqListSchema = new Schema({
    network: String,
    dexToolSlug: {
        type: String,
        default: null
    },
    currency: new Schema({
        address: {
            type: String,
            index: true
        },
        decimals: Number,
        name: String,
        symbol: String,
        tokenId: String,
        tokenType: String
    }),
    count: Number,
    senders: Number,
    receivers: Number,
    days: Number,
    from_date: String,
    till_date: String,
    amount: Number,
    amount_usd: Number,
}, { timestamps: { createdAt: true, updatedAt: true } });

const bqPairsSchema = new Schema({
    network: String,
    dexToolSlug: {
        type: String,
        default: null
    },
    exchange: new Schema({
        address: new Schema({
            address: String
        }),
        fullName: String,
        fullNameWithId: String
    }),
    smartContract: new Schema({
        address: new Schema({
            address: {
                type: String,
                index: true
            }
        }),
        contractType: String,
        currency: new Schema({
            decimals: Number,
            name: String,
            symbol: String,
            tokenType: String
        }),
        protocolType: String
    }),
    buyCurrency: new Schema({
        address: String,
        decimals: Number,
        name: String,
        symbol: String,
        tokenId: String,
        tokenType: String
    }),
    sellCurrency: new Schema({
        address: String,
        decimals: Number,
        name: String,
        symbol: String,
        tokenId: String,
        tokenType: String
    }),
    buyCurrencyPrice: String,
    sellCurrencyPrice: String,
    count: Number,
    daysTraded: Number,
    started: String
})

const BQListModel = model('BQList', bqListSchema, 'BQList');
const BQPairModel = model('BQPair', bqPairsSchema, 'BQPair');

const bqModel = {
    BQListModel,
    BQPairModel,
};

export default bqModel;