import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

const filePath = 'twitterLogFile.txt';

async function twitterController(
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  try {
    const { body, url, params, query } = _req;
    const log = {
      url,
      body,
      params,
      query,
    };

    fs.appendFileSync(filePath, `${JSON.stringify(log, null, 2)}\n`);
    return _res.status(200).json({ msg: 'OK' });
  } catch (error) {
    _next(error);
    return;
  }
}

export default twitterController;
