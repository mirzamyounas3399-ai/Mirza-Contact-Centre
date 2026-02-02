import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { User } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      // Check if user already exists
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser: User = {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        role: role || 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: Date.now()
      };

      const createdUser = UserModel.create(newUser);

      // Generate token
      const token = generateToken({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      });

      // Remove password from response
      const userResponse = { ...createdUser };
      delete userResponse.password;

      res.status(201).json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password!);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userResponse = { ...user };
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
}
