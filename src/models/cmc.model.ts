import { Schema, model } from "mongoose";

const cmcPlatformSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    name: String,
    symbol: String,
    slug: String,
}, { timestamps: { createdAt: true, updatedAt: true } });

const cmcQuoteSchema = new Schema({
    price: Number,
    volume_24h: Number,
    volume_change_24h: Number,
    percent_change_1h: Number,
    percent_change_24h: Number,
    percent_change_7d: Number,
    percent_change_30d: Number,
    percent_change_60d: Number,
    percent_change_90d: Number,
    market_cap: Number,
    market_cap_dominance: Number,
    fully_diluted_market_cap: Number,
    tvl: Number,
    last_updated: String
}, { timestamps: { createdAt: true, updatedAt: true } });

const cmcListSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    name: String,
    symbol: String,
    slug: String,
    cmc_rank: Number,
    num_market_pairs: Number,
    circulating_supply: Number,
    total_supply: Number,
    max_supply: Number,
    infinite_supply: Boolean,
    last_updated: String,
    date_added: String,
    tags: [String],
    self_reported_circulating_supply: Number,
    self_reported_market_cap: Number,
    tvl_ratio: Number,
    platform: new Schema({
        id: {
            type: Number,
            ref: 'CMCPlatform'
        },
        token_address: String
    }),
    quote: {
        type: Map,
        of: cmcQuoteSchema
    }
}, { timestamps: { createdAt: true, updatedAt: true } });

const cmcMetadataSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    name: String,
    symbol: String,
    slug: String,
    category: String,
    description: String,
    logo: String,
    subreddit: String,
    notice: String,
    tags: [String],
    "tag-names": [String],
    "tag-groups": [String],
    urls: new Schema({
        website: [String],
        twitter: [String],
        message_board: [String],
        chat: [String],
        facebook: [String],
        explorer: [String],
        reddit: [String],
        technical_doc: [String],
        source_code: [String],
        announcement: [String]
    }),
    platform: new Schema({
        id: {
            type: Number,
            ref: 'CMCPlatform'
        },
        token_address: String,
    }),
    date_added: String,
    twitter_username: String,
    is_hidden: Number,
    date_launched: String,
    contract_address: [new Schema({
        contract_address: String,
        platform: new Schema({
            name: String,
            coin: new Schema({
                id: String,
                name: String,
                symbol: String,
                slug: String
            })
        }),
    })],
    self_reported_circulating_supply: Number,
    self_reported_tags: [String],
    self_reported_market_cap: Number,
    infinite_supply: Boolean,

}, { timestamps: { createdAt: true, updatedAt: true } });

const CMCPlatformModel = model('CMCPlatform', cmcPlatformSchema, 'CMCPlatform');
const CMCListModel = model('CMCList', cmcListSchema, 'CMCList');
const CMCMetadataModel = model('CMCMetadata', cmcMetadataSchema, 'CMCMetadata');

const cmcModel = {
    CMCPlatformModel,
    CMCListModel,
    CMCMetadataModel
}

export default cmcModel;