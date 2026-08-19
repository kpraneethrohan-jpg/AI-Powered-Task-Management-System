import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { useAuth } from '../context/AuthContext';

function EmployeeTodo() {
  const { user } = useAuth();
  
  return (
    <NotificationProvider userId={user?.userId}>
      <div className="flex h-screen bg-white antialiased">
        <EmployeeDashboard />
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <Outlet />
        </main>
      </div>
    </NotificationProvider>
  );
}

export default EmployeeTodo;