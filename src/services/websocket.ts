const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private isIntentionalDisconnect = false;

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isIntentionalDisconnect = false;
    const wsUrl = `${WS_BASE_URL}?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data.type);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error });
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        this.emit('disconnected', {});
        this.ws = null;

        // Attempt to reconnect if not intentional
        if (!this.isIntentionalDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            const token = localStorage.getItem('nexus_token');
            if (token) {
              this.connect(token);
            }
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Convenience methods for common actions
  sendMessage(message: any) {
    this.send('message', message);
  }

  sendCallSignal(signal: any) {
    this.send('call-signal', signal);
  }

  sendTyping(receiverId: string, isTyping: boolean) {
    this.send('typing', { receiverId, isTyping });
  }
}

export const wsService = new WebSocketService();
