import { Router } from 'express';
import controller from './controllers/controller';
import publicController from './controllers/publicController';
import twitterController from './controllers/twitterController';
import authMiddleware from './middlewares/auth.middleware';
import priceUpdateController from './controllers/priceUpdateController';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.post('/public', publicController);
router.get('/twitter-callback', twitterController);
router.get('/update-price', priceUpdateController);

router.use('/', authMiddleware, controller);

export default router;
