import { Router } from 'express';
import controller from './controller';
import authMiddleware from './middlewares/auth.middleware';
import publicController from './publicController';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.post('/public', publicController);

router.use('/', authMiddleware, controller);

export default router;
