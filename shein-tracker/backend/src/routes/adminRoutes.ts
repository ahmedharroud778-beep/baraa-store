import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', adminController.login);
router.get('/settings', adminController.getSettings);
router.put('/settings', authMiddleware, adminController.updateSettings);
router.get('/orders', authMiddleware, adminController.getAllOrders);
router.put('/orders/:id/status', authMiddleware, adminController.updateOrderStatus);
router.delete('/orders/:id', authMiddleware, adminController.deleteOrder);

// Cities
router.get('/cities', authMiddleware, adminController.getCities);
router.post('/cities', authMiddleware, adminController.addCity);
router.delete('/cities/:id', authMiddleware, adminController.deleteCity);

// Clothing
router.get('/clothing-items', authMiddleware, adminController.getClothingItems);
router.post('/clothing-items', authMiddleware, adminController.addClothingItem);
router.delete('/clothing-items/:id', authMiddleware, adminController.deleteClothingItem);
router.post('/clothing-items/:id/weights', authMiddleware, adminController.addClothingWeight);
router.delete('/clothing-weights/:id', authMiddleware, adminController.deleteClothingWeight);

export default router;
