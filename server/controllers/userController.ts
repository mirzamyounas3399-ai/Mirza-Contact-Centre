import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../models/User.js';

export class UserController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = UserModel.findAll();
      
      // Remove passwords from response
      const usersResponse = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersResponse);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getUsersByRole(req: AuthRequest, res: Response) {
    try {
      const { role } = req.params;
      
      if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const users = UserModel.findAllByRole(role);
      
      // Remove passwords from response
      const usersResponse = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersResponse);
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Users can only update their own profile unless they're admin
      if (req.user!.userId !== id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this user' });
      }

      // Don't allow role changes unless admin
      if (updates.role && req.user!.role !== 'admin') {
        delete updates.role;
      }

      // Don't allow password changes through this endpoint
      if (updates.password) {
        delete updates.password;
      }

      const updatedUser = UserModel.update(id, updates);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Only admins can delete users
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const success = UserModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}
