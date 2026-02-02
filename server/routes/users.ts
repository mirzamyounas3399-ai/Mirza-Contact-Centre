import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', UserController.getAllUsers);
router.get('/role/:role', UserController.getUsersByRole);
router.get('/:id', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
