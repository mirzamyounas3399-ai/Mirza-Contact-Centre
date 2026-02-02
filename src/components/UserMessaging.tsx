import React, { useState, useEffect, useRef } from 'react';
import { User, Message, MessageType } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';

interface UserMessagingProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserMessaging: React.FC<UserMessagingProps> = ({ user, onUpdateUser }) => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAdmins();
    setupWebSocket();

    return () => {
      wsService.off('message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (selectedAdmin) {
      loadConversation(selectedAdmin.id);
    }
  }, [selectedAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupWebSocket = () => {
    wsService.on('message', handleNewMessage);
  };

  const handleNewMessage = (data: any) => {
    setMessages(prev => [...prev, data]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAdmins = async () => {
    try {
      const data = await api.getUsersByRole('admin');
      setAdmins(data);
      if (data.length > 0 && !selectedAdmin) {
        setSelectedAdmin(data[0]);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  };

  const loadConversation = async (adminId: string) => {
    try {
      setLoading(true);
      const data = await api.getConversation(adminId);
      setMessages(data);
      // Mark conversation as read
      await api.markConversationAsRead(adminId);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAdmin) return;

    try {
      const message = {
        receiverId: selectedAdmin.id,
        content: newMessage,
        type: 'text' as MessageType
      };

      await api.sendMessage(message);
      wsService.sendMessage(message);
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAdmin) return;

    try {
      setUploading(true);
      const uploadResult = await api.uploadFile(file);

      const message = {
        receiverId: selectedAdmin.id,
        content: uploadResult.url,
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'voice' : 'file' as MessageType,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType
      };

      await api.sendMessage(message);
      wsService.sendMessage(message);
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === user.id;
    
    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-white/10 text-white'
          }`}
        >
          {message.type === 'text' && <p className="text-sm">{message.content}</p>}
          
          {message.type === 'image' && (
            <img
              src={message.content}
              alt="Uploaded image"
              className="rounded-lg max-w-full"
            />
          )}
          
          {message.type === 'video' && (
            <video
              src={message.content}
              controls
              className="rounded-lg max-w-full"
            />
          )}
          
          {message.type === 'voice' && (
            <audio src={message.content} controls className="w-full" />
          )}
          
          {message.type === 'file' && (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:underline"
            >
              <span>📎</span>
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs opacity-75">{message.fileSize}</p>
              </div>
            </a>
          )}
          
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
      {/* Admins List */}
      <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Admins</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {admins.map((admin) => (
            <div
              key={admin.id}
              onClick={() => setSelectedAdmin(admin)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedAdmin?.id === admin.id
                  ? 'bg-blue-500/20'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">{admin.name}</p>
                  <p className="text-xs text-gray-400">{admin.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 flex flex-col">
        {selectedAdmin ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center space-x-3">
              <img
                src={selectedAdmin.avatar}
                alt={selectedAdmin.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-white">{selectedAdmin.name}</p>
                <p className="text-xs text-green-400">● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? '⏳' : '📎'}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select an admin to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessaging;
