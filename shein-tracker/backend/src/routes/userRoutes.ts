import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.patch('/:id', userController.updateUser);

export default router;
