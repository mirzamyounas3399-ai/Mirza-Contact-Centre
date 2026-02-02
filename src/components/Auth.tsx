import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';

interface AuthProps {
  onAuth: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await api.login(formData.email, formData.password);
      } else {
        response = await api.register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
      }

      // Connect WebSocket
      wsService.connect(response.token);

      onAuth(response.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
            NC
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Nexus Contact Centre</h1>
          <p className="text-gray-400">Connect. Communicate. Collaborate.</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
