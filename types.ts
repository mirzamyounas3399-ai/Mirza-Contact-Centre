
export type Role = 'admin' | 'user';
export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'file';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string; // text or ID of blob in mediaDb
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
