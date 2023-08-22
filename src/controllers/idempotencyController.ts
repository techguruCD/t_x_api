import { NextFunction, Request, Response } from "express";
import idempotencyKeyModel from "../models/idempotency-key.model";

async function idempotencyController(_req: Request, _res: Response, _next: NextFunction) {
    try {
        const idempotencyKey = _req.headers['idempotency-key'];

        if (!idempotencyKey) {
            return _res.status(400).json({ error: 'idempotencyKey not found in the header' });
        }

        const idempotencyKeyInModel = await idempotencyKeyModel.findOne({
            idempotencyKey
        });

        if (idempotencyKeyInModel) {
            return _res.status(200).json({ success: true })
        }

        const body = _req.body;
        console.log(`body`, body);

        await new idempotencyKeyModel({
            idempotencyKey
        }).save()

        return _res.status(200).json({ success: true })
    } catch (error) {
        console.log(`> idempotencyController`, error);
        return _res.status(200).json({ success: true })
    }
}

export default idempotencyController;