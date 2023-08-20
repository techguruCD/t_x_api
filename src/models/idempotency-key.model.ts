import { Schema, model } from "mongoose";

const idempotencyKeySchema = new Schema({
    idempotencyKey: {
        type: String,
        unique: true,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

idempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

const idempotencyKeyModel = model('IdempotencyKey', idempotencyKeySchema, 'IdempotencyKey');

export default idempotencyKeyModel;