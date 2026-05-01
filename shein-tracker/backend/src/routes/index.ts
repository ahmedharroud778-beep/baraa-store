import { Router } from 'express';
import estimateRoutes from './estimateRoutes';
import orderRoutes from './orderRoutes';
import adminRoutes from './adminRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/estimate', estimateRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;
