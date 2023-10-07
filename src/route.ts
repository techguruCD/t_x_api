import { Router } from 'express';
import controller from './controllers/controller';
import publicController from './controllers/publicController';
import authMiddleware from './middlewares/auth.middleware';
import idempotencyController from './controllers/idempotencyController';
import alertApiControllers from './controllers/alert-api.controller';

const router = Router();

router.get('/ping', (_req, res) => {
  return res.status(200).json({ msg: 'OK' });
});

router.post('/public', publicController);
router.post('/idempotency-check', idempotencyController);

router.get('/alerts/user/:userId', authMiddleware, alertApiControllers.getAllAlertsForUserId);
router.post('/alerts/user/:userId/platform/cg', authMiddleware, alertApiControllers.createAlertForUserIdOnCoingeckoPlatform);
router.post('/alerts/user/:userId/platform/dex', authMiddleware, alertApiControllers.createAlertForUserIdOnDexPlatform);
router.get('/alerts/:alertId/user/:userId', authMiddleware, alertApiControllers.getAlertByAlertIdForUserId);
router.delete('/alerts/:alertId/user/:userId', authMiddleware, alertApiControllers.deleteAlertByAlertIdForUserId);
router.use('/', authMiddleware, controller);

export default router;
