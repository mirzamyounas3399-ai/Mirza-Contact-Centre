import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import { MessageModel } from '../models/Message.js';
import { Message } from '../types/index.js';

export class MessageController {
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { receiverId, content, type, fileName, fileSize, mimeType } = req.body;
      const senderId = req.user!.userId;

      if (!receiverId || !content || !type) {
        return res.status(400).json({ error: 'Receiver, content, and type are required' });
      }

      const message: Message = {
        id: uuidv4(),
        senderId,
        receiverId,
        content,
        type,
        timestamp: Date.now(),
        read: false,
        fileName,
        fileSize,
        mimeType
      };

      const createdMessage = MessageModel.create(message);
      res.status(201).json(createdMessage);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async getConversation(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 100;

      const messages = MessageModel.findConversation(currentUserId, userId, limit);
      res.json(messages);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  static async getUserMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 100;

      const messages = MessageModel.findByUserId(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error('Get user messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const success = MessageModel.markAsRead(messageId);

      if (!success) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  static async markConversationAsRead(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.userId;

      const count = MessageModel.markConversationAsRead(currentUserId, userId);
      res.json({ message: `${count} messages marked as read` });
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      res.status(500).json({ error: 'Failed to mark conversation as read' });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = MessageModel.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const success = MessageModel.delete(messageId);

      if (!success) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
}
