import { Schema, model } from "mongoose";

const aegisChainlistSchema = new Schema({
  chainId: {
    type: Number,
    unique: true
  },
  name: String,
  status: Number
});

const aegisTokenQuickCheckSchema = new Schema({
  can_change_balance: String,
  can_external_call: String,
  can_selfdestruct: String,
  can_set_cooldown: String,
  can_set_fee: String,
  can_set_paused: String,
  can_take_ownership: String,
  contract_address: {
    type: String,
    unique: true,
    index: true
  },
  contract_name: String,
  created_at: Schema.Types.Mixed, // Aegis API is inconsistent
  creator: String,
  decimals: Number,
  is_anti_whale: String,
  is_black_listed: String,
  is_burnable: String,
  is_fake: String,
  is_gastoken_mint: String,
  is_hidden_owner: String,
  is_honeypot: String,
  is_mintable: String,
  is_obfuscated: String,
  is_opensource: String,
  is_proxy: String,
  is_renounced_ownership: String,
  is_scamtoken: String,
  is_trust: String,
  is_white_listed: String,
  owner: String,
  tax_info: new Schema({
    buy_tax: String,
    is_buyable: String,
    is_sellable: String,
    msg: String,
    sell_tax: String
  }),
  token_name: String,
  token_symbol: String,
  token_type: String,
  top_holder: [
    new Schema({
      addr: String,
      amount: Number,
      percentage: Number,
      rank: Number,
      title: String
    })
  ],
  vulnerable: String
});

const AegisChainlistModel = model('AegisChainlist', aegisChainlistSchema, 'AegisChainlist');
const AegisTokenQuickCheckModel = model('AegisTokenQuickCheck', aegisTokenQuickCheckSchema, 'AegisTokenQuickCheck');

const aegisModel = {
  AegisChainlistModel,
  AegisTokenQuickCheckModel
}

export default aegisModel;