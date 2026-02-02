import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
    this.setupHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      console.log('New WebSocket connection attempt');

      // Extract token from query string
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        ws.userId = decoded.userId;
        ws.isAlive = true;

        // Store client connection
        this.clients.set(decoded.userId, ws);
        console.log(`✅ User ${decoded.userId} connected via WebSocket`);

        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connected',
          userId: decoded.userId
        }));

        // Handle messages
        ws.on('message', (data: Buffer) => {
          this.handleMessage(ws, data);
        });

        // Handle pong (heartbeat response)
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle disconnection
        ws.on('close', () => {
          if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`❌ User ${ws.userId} disconnected`);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        ws.close(1008, 'Invalid token');
      }
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message.type);

      switch (message.type) {
        case 'message':
          this.handleChatMessage(ws, message);
          break;
        case 'call-signal':
          this.handleCallSignal(ws, message);
          break;
        case 'typing':
          this.handleTyping(ws, message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleChatMessage(ws: AuthenticatedWebSocket, message: any) {
    const { receiverId, ...messageData } = message;
    
    // Send to receiver if online
    const receiverWs = this.clients.get(receiverId);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      receiverWs.send(JSON.stringify({
        type: 'message',
        ...messageData
      }));
    }

    // Echo back to sender (for multi-device support)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message-sent',
        ...messageData
      }));
    }
  }

  private handleCallSignal(ws: AuthenticatedWebSocket, signal: any) {
    const { toId, ...signalData } = signal;
    
    // Forward signal to the recipient
    const recipientWs = this.clients.get(toId);
    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
      recipientWs.send(JSON.stringify({
        type: 'call-signal',
        fromId: ws.userId,
        ...signalData
      }));
    }
  }

  private handleTyping(ws: AuthenticatedWebSocket, data: any) {
    const { receiverId, isTyping } = data;
    
    const receiverWs = this.clients.get(receiverId);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      receiverWs.send(JSON.stringify({
        type: 'typing',
        userId: ws.userId,
        isTyping
      }));
    }
  }

  private setupHeartbeat() {
    // Ping clients every 30 seconds to keep connection alive
    const interval = setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (ws.isAlive === false) {
          this.clients.delete(userId);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Send message to specific user
  public sendToUser(userId: string, message: any) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Broadcast to all connected clients
  public broadcast(message: any, excludeUserId?: string) {
    const data = JSON.stringify(message);
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    const ws = this.clients.get(userId);
    return ws !== undefined && ws.readyState === WebSocket.OPEN;
  }

  // Get online users
  public getOnlineUsers(): string[] {
    return Array.from(this.clients.keys());
  }
}
