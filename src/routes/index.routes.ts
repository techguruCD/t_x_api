import { Router } from 'express';

const router = Router();

router.get('/ping', (_req, _res) => {
  return _res.status(200).json({ msg: 'OK' });
});

export default router;
