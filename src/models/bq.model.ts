import { Schema, model } from "mongoose";

const bqPairsSchema = new Schema({
    network: {
        type: String,
        index: true
    },
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
    sellCurrency: new Schema({
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
    buyCurrencyPrice: String,
    sellCurrencyPrice: String,
    count: Number,
    daysTraded: Number,
    started: String
})

const BQPairModel = model('BQPair', bqPairsSchema, 'BQPair');

const bqModel = {
    BQPairModel,
};

export default bqModel;