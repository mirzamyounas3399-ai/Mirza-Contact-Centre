import db from './database.js';
import { User } from '../types/index.js';

export class UserModel {
  static create(user: User): User {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, password, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      user.id,
      user.email,
      user.name,
      user.password,
      user.role,
      user.avatar,
      user.createdAt || Date.now()
    );
    
    return this.findById(user.id)!;
  }

  static findById(id: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  static findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapRowToUser(row));
  }

  static findAllByRole(role: string): User[] {
    const stmt = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC');
    const rows = stmt.all(role) as any[];
    return rows.map(row => this.mapRowToUser(row));
  }

  static update(id: string, updates: Partial<User>): User | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      role: row.role,
      avatar: row.avatar,
      createdAt: row.created_at
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
