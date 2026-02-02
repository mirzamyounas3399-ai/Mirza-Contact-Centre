import db from './database.js';
import { Message } from '../types/index.js';

export class MessageModel {
  static create(message: Message): Message {
    const stmt = db.prepare(`
      INSERT INTO messages (
        id, sender_id, receiver_id, content, type, timestamp, 
        read, file_name, file_size, mime_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      message.id,
      message.senderId,
      message.receiverId,
      message.content,
      message.type,
      message.timestamp,
      message.read ? 1 : 0,
      message.fileName || null,
      message.fileSize || null,
      message.mimeType || null
    );
    
    return this.findById(message.id)!;
  }

  static findById(id: string): Message | undefined {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToMessage(row) : undefined;
  }

  static findConversation(userId1: string, userId2: string, limit: number = 100): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(userId1, userId2, userId2, userId1, limit) as any[];
    return rows.map(row => this.mapRowToMessage(row)).reverse();
  }

  static findByUserId(userId: string, limit: number = 100): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(userId, userId, limit) as any[];
    return rows.map(row => this.mapRowToMessage(row)).reverse();
  }

  static markAsRead(messageId: string): boolean {
    const stmt = db.prepare('UPDATE messages SET read = 1 WHERE id = ?');
    const result = stmt.run(messageId);
    return result.changes > 0;
  }

  static markConversationAsRead(userId: string, otherUserId: string): number {
    const stmt = db.prepare(`
      UPDATE messages 
      SET read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND read = 0
    `);
    const result = stmt.run(otherUserId, userId);
    return result.changes;
  }

  static getUnreadCount(userId: string): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE receiver_id = ? AND read = 0
    `);
    const row = stmt.get(userId) as any;
    return row.count;
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private static mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      type: row.type,
      timestamp: row.timestamp,
      read: row.read === 1,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type
    };
  }
}
