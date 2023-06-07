import { Router } from 'express';
import btc from '../controllers/bitquery.controller';

const router = Router();

router.post('/', btc.bitqueryController);
export default router;
