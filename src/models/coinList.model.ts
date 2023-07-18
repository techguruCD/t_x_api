import { Schema, model } from "mongoose";

const coinListSchema = new Schema({
    id: String,
    symbol: String,
    name: String
});

const coinListModel = model('CoinList', coinListSchema, 'CoinList');

export default coinListModel;