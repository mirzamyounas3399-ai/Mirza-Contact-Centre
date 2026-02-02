import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  admin: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const regularUsers = users.filter(u => u.role === 'user');
  const adminUsers = users.filter(u => u.role === 'admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Regular Users</p>
              <p className="text-3xl font-bold text-white mt-1">{regularUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admins</p>
              <p className="text-3xl font-bold text-white mt-1">{adminUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">All Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.id !== admin.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
