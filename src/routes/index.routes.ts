import { Router } from 'express';
import bitqueryRoutes from './bitquery.routes';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.use('/bitquery', bitqueryRoutes);

export default router;
