import { Router } from 'express';
import controller from './controllers/controller';
import publicController from './controllers/publicController';
import twitterController from './controllers/twitterController';
import authMiddleware from './middlewares/auth.middleware';
import priceUpdateController from './controllers/priceUpdateController';
import coinListUpdateController from './controllers/coinListUpdateController';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.post('/public', publicController);
router.get('/twitter-callback', twitterController);
router.get('/update-price', priceUpdateController); // every minute
router.get('/update-coin-list', coinListUpdateController); // every 5 minutes

router.use('/', authMiddleware, controller);

export default router;
