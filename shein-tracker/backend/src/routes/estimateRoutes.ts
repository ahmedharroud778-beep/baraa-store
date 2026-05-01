import { Router } from 'express';
import { estimateController } from '../controllers/estimateController';

const router = Router();

router.get('/config', estimateController.getConfig);
router.post('/price', estimateController.calculatePrice);

export default router;
