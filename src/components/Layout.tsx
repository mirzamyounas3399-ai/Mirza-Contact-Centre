import React from 'react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      {user && (
        <header className="bg-black/40 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  NC
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Nexus Contact Centre</h1>
                  <p className="text-xs text-gray-400">{user.role === 'admin' ? 'Admin Dashboard' : 'User Portal'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-400 text-sm">
            © 2024 Nexus Contact Centre. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
