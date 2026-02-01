
import React, { useState, useEffect } from 'react';
import { User } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import UserMessaging from './components/UserMessaging';
import CallInterface from './components/CallInterface';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nexus_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('nexus_current_user', JSON.stringify(newUser));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
    storage.updateUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_current_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {!user ? (
        <Auth onAuth={handleAuth} />
      ) : user.role === 'admin' ? (
        <AdminDashboard admin={user} />
      ) : (
        <UserMessaging user={user} onUpdateUser={handleUpdateUser} />
      )}
      {user && <CallInterface currentUser={user} onCallEnded={() => {}} />}
    </Layout>
  );
};

export default App;
