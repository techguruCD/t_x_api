import { Router } from 'express';
import controller from './controller';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.use('/', controller);

export default router;
