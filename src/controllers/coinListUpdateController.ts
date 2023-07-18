import { NextFunction, Request, Response } from "express";
import cgRequests from "../coingecko/requests";
import coinListModel from "../models/coinList.model";

async function coinListUpdateController(_req: Request, _res: Response, _next: NextFunction) {
    try {
        const coinsList = await cgRequests.coinsList();
        await coinListModel.deleteMany({});
        await coinListModel.insertMany(coinsList);
        _res.status(200).json({ success: true });
    } catch (error) {
        return _next(error);
    }
}

export default coinListUpdateController;