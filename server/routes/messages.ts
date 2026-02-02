import { Router } from 'express';
import { MessageController } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', MessageController.sendMessage);
router.get('/', MessageController.getUserMessages);
router.get('/conversation/:userId', MessageController.getConversation);
router.get('/unread/count', MessageController.getUnreadCount);
router.put('/:messageId/read', MessageController.markAsRead);
router.put('/conversation/:userId/read', MessageController.markConversationAsRead);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;
