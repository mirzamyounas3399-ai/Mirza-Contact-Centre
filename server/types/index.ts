export type Role = 'admin' | 'user';
export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'file';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  avatar: string;
  createdAt?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  timestamp: number;
  read?: boolean;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}

export interface CallSignal {
  fromId: string;
  toId: string;
  type: 'offer' | 'answer' | 'hangup' | 'candidate';
  payload: any;
  timestamp: number;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}
