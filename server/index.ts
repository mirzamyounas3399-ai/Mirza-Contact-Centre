import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Import database and initialize
import { initDatabase } from './models/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';

// Import WebSocket service
import { WebSocketService } from './services/websocket.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Initialize WebSocket service
const wsService = new WebSocketService(wss);

// Start server
server.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 HTTP: http://localhost:${PORT}`);
  console.log(`🚀 WebSocket: ws://localhost:${PORT}/ws`);
  console.log('🚀 ===================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { wsService };
