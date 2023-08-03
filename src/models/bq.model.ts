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
        name: {
            type: String,
            index: true
        },
        symbol: {
            type: String,
            index: true
        },
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
    baseCurrency: {
        type: String,
        ref: 'BQList'
    },
    quoteCurrency: {
        type: String,
        ref: 'BQList'
    },
    exchange: new Schema({
        address: String,
        fullName: String,
        fullNameWithId: String,
        name: String
    }),
    pairContract: new Schema({
        address: {
            type: String,
            index: true
        },
        currency: new Schema({
            decimals: Number,
            name: String,
            symbol: String,
            tokenType: String
        }),
        contractType: String,
        protocolType: String
    }),
    lastFetchDate: String,
    dexTrades: Number
});

const BQListModel = model('BQList', bqListSchema, 'BQList');
const BQPairModel = model('BQPair', bqPairsSchema, 'BQPair');

const bqModel = {
    BQListModel,
    BQPairModel
};

export default bqModel;