import { Schema, model } from 'mongoose';

const logCoinInfoSchema = new Schema(
    {
        param: new Schema({
            platform: String,
            value: String,
            type: String,
        }),
        ip: String,
        userId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: {
            updatedAt: true,
            createdAt: true,
        },
    }
);

const LogCoinInfoModel = model('LogCoinInfo', logCoinInfoSchema, 'LogCoinInfo');

const logModel = {
    LogCoinInfoModel
};

export default logModel;
