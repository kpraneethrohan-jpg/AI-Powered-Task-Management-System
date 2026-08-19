import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { useAuth } from '../context/AuthContext';

function AdminTodo() {
  const { user } = useAuth();
  
  return (
    <NotificationProvider userId={user?.userId}>
      <div className="flex h-screen bg-white antialiased">
        <AdminDashboard />
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <Outlet />
        </main>
      </div>
    </NotificationProvider>
  );
}

export default AdminTodo;