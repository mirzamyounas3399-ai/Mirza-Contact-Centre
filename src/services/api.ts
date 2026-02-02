const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nexus_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('nexus_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('nexus_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, role?: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // User endpoints
  async getAllUsers() {
    return this.request<any[]>('/users');
  }

  async getUsersByRole(role: string) {
    return this.request<any[]>(`/users/role/${role}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, updates: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Message endpoints
  async sendMessage(message: any) {
    return this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getUserMessages(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/messages${query}`);
  }

  async getConversation(userId: string, limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/messages/conversation/${userId}${query}`);
  }

  async markAsRead(messageId: string) {
    return this.request<{ message: string }>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async markConversationAsRead(userId: string) {
    return this.request<{ message: string }>(`/messages/conversation/${userId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/messages/unread/count');
  }

  async deleteMessage(messageId: string) {
    return this.request<{ message: string }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiService();
