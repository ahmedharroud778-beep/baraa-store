import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.get('/order-id/:orderId', orderController.getOrderByOrderId);

export default router;
